import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useMemo, useState } from "react";
import Form from "../ui/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi, queryApi } from "../lib/fetch";
import { object, string, infer as inferType } from "zod";
import { UserContext } from "../user";
import { Like, type Reply, Vote } from "../lib/votes";
import Sort from "./SortOrFilter";
import { usePlaceSort } from "../lib/sort";
import { useSearchParams } from "react-router";
import FetchUsername from "./FetchUsername";
import InputField from "../ui/InputField";
import CheckboxField from "../ui/CheckboxField";
import styled from "styled-components";
import Card from "../ui/Card";

const SORT_OPTIONS = [
  "likes",
  "last-added",
  "upvotes-first",
  "downvotes-first",
];

const StyledComments = styled.div`
  margin-top: 48px;
`;

const CommentList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledSort = styled(Sort)`
  margin-top: 32px;
`;

export default function Comments({
  placeId,
  voteId,
  voteText,
  votes,
}: {
  placeId: string;
  voteId: string | undefined;
  voteText: string | undefined;
  votes: Vote[];
}) {
  const { user } = useContext(UserContext);

  const [params, setParams] = useSearchParams();

  const sort = usePlaceSort();
  function setSort(type: string) {
    params.set("sort", type);
    setParams(params);
  }

  const votesWithText = votes.filter((vote) => vote.text);

  return (
    <StyledComments>
      <h3>Comments</h3>
      {user && (
        <CommentForm placeId={placeId} voteId={voteId} voteText={voteText} />
      )}
      <StyledSort
        disabled={votesWithText.length <= 1}
        types={SORT_OPTIONS}
        value={sort}
        setValue={setSort}
        isSort
      />
      {votesWithText.length > 0 ? (
        <CommentList role="list">
          {votesWithText.map((vote) => (
            <li key={vote.userId}>
              <Comment placeId={placeId} vote={vote} />
            </li>
          ))}
        </CommentList>
      ) : (
        <p>
          <i>no comments</i>
        </p>
      )}
    </StyledComments>
  );
}

function CommentForm({
  placeId,
  voteId,
  voteText,
}: {
  placeId: string;
  voteId?: string | undefined;
  voteText: string | undefined;
}) {
  const { mutation, onSubmit } = useComment(placeId, voteId);

  const { register, handleSubmit, reset } = useForm<CommentScheme>({
    resolver: zodResolver(commentScheme),
  });

  useEffect(() => {
    if (!voteText) {
      reset();
    }
  }, [voteText]);

  return (
    <Form
      mutation={mutation}
      onSubmit={handleSubmit(onSubmit)}
      disabled={!voteId}
    >
      <label htmlFor="comment" className="sr-only">
        comment
      </label>
      <textarea
        id="comment"
        cols={20}
        rows={4}
        {...register("text")}
        defaultValue={voteText}
      ></textarea>
    </Form>
  );
}

function useComment(id: string, voteId?: string) {
  const queryClient = useQueryClient();

  const onSubmit: SubmitHandler<CommentScheme> = (data) => {
    mutation.mutate({ ...data, id, voteId });
  };

  const mutation = useMutation({
    mutationFn: ({
      id,
      voteId,
      text,
    }: {
      id: string;
      voteId: string | undefined;
      text: string;
    }) => mutateApi("PATCH", `/places/${id}/votes/${voteId}`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places", id] });
      queryClient.invalidateQueries({
        queryKey: ["places", { sort: "comments" }],
      });
    },
  });

  return { mutation, onSubmit };
}

const commentScheme = object({ text: string().min(1) });
type CommentScheme = inferType<typeof commentScheme>;

const CommentButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ReplyList = styled.ul`
  margin-top: 16px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

function Comment({ placeId, vote }: { placeId: string; vote: Vote }) {
  const { user } = useContext(UserContext);
  const isMyComment = user?.id === vote.userId;

  const deleteCommentMutation = useDeleteComment(placeId, vote._id);

  const { likeMutation, isLiked } = useLike(placeId, vote._id, vote.likes);

  const [showReplies, setShowReplies] = useState(false);

  return (
    <Card>
      <p>
        <b>{vote.text}</b> by <FetchUsername userId={vote.userId} />
      </p>
      <p id={`comment-${vote._id}`}>
        {vote.likes.length} like{vote.likes.length !== 1 && "s"}
      </p>
      <CommentButtonsWrapper>
        {user && (
          <button
            disabled={likeMutation.isPending}
            onClick={() => likeMutation.mutate()}
          >
            {isLiked ? "remove" : "add"} like
          </button>
        )}
        {isMyComment && (
          <button
            disabled={deleteCommentMutation.isPending}
            onClick={() => deleteCommentMutation.mutate()}
          >
            delete
          </button>
        )}
      </CommentButtonsWrapper>
      {deleteCommentMutation.isError && (
        <p>{deleteCommentMutation.error.message}</p>
      )}
      {likeMutation.isError && <p>{likeMutation.error.message}</p>}
      <CheckboxField
        type="checkbox"
        id={`show-replies-${vote._id}`}
        label="show replies"
        checked={showReplies}
        onChange={(e) => setShowReplies(e.currentTarget.checked)}
      />
      {showReplies && (
        <>
          {vote.replies.length > 0 ? (
            <ReplyList role="list">
              {vote.replies.map((reply) => (
                <li key={reply._id}>
                  <Reply placeId={placeId} reply={reply} voteId={vote._id} />
                </li>
              ))}
            </ReplyList>
          ) : (
            <p>
              <i>no replies</i>
            </p>
          )}
          {user && <ReplyForm placeId={placeId} voteId={vote._id} />}
        </>
      )}
    </Card>
  );
}

function useDeleteComment(placeId: string, voteId: string) {
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: () =>
      mutateApi("PATCH", `/places/${placeId}/votes/${voteId}`, { text: "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places", placeId] });
      queryClient.invalidateQueries({
        queryKey: ["places", { sort: "comments" }],
      });
    },
  });
  return deleteCommentMutation;
}

function useLike(placeId: string, voteId: string, likes: Like[]) {
  const { user } = useContext(UserContext);

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () =>
      mutateApi("PATCH", `/places/${placeId}/votes/${voteId}/likes`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["places", placeId] }),
  });

  const isLiked = useMemo(
    () => likes.findIndex((like) => like.userId === user?.id) !== -1,
    [likes.length, user?.id]
  );

  return { likeMutation, isLiked };
}

function ReplyForm({
  placeId,
  voteId,
  replyId,
  replyUserId,
}: {
  placeId: string;
  voteId: string;
  replyId?: string;
  replyUserId?: string;
}) {
  const { mutation, onSubmit } = useReply(
    placeId,
    voteId,
    replyId,
    replyUserId
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful },
    reset,
  } = useForm<CommentScheme>({
    resolver: zodResolver(commentScheme),
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} mutation={mutation}>
      <InputField
        type="text"
        id="reply"
        {...register("text")}
        error={undefined}
      />
    </Form>
  );
}

function useReply(
  placeId: string,
  voteId: string,
  replyId?: string,
  replyUserId?: string
) {
  const queryClient = useQueryClient();

  const onSubmit: SubmitHandler<CommentScheme> = (data) => {
    mutation.mutate({ ...data, placeId, voteId, replyId, replyUserId });
  };

  const mutation = useMutation({
    mutationFn: ({
      placeId,
      voteId,
      text,
      replyId,
      replyUserId,
    }: {
      placeId: string;
      voteId: string;
      text: string;
      replyId: string | undefined;
      replyUserId: string | undefined;
    }) =>
      mutateApi("POST", `/places/${placeId}/votes/${voteId}/replies`, {
        text,
        replyId,
        replyUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places", placeId] });
    },
  });

  return { mutation, onSubmit };
}

function Reply({
  placeId,
  voteId,
  reply,
}: {
  placeId: string;
  voteId: string;
  reply: Reply;
}) {
  const { user } = useContext(UserContext);
  const isMyReply = user?.id === reply.userId;

  const deleteReplyMutation = useDeleteReply(placeId, voteId, reply._id);

  return (
    <Card $layer="high">
      <p id={`reply-${reply._id}`}>
        {reply.text} by <FetchUsername userId={reply.userId} />
      </p>
      <p>
        to{" "}
        <a
          href={
            reply.replyId ? `#reply-${reply.replyId}` : `#comment-${voteId}`
          }
        >
          {reply.replyId ? "reply" : "root"}
        </a>{" "}
        {reply.replyUserId && (
          <>
            by <FetchUsername userId={reply.replyUserId} />
          </>
        )}
      </p>
      {isMyReply && (
        <button
          disabled={deleteReplyMutation.isPending}
          onClick={() => deleteReplyMutation.mutate()}
        >
          delete
        </button>
      )}
      {deleteReplyMutation.isError && (
        <p>{deleteReplyMutation.error.message}</p>
      )}
    </Card>
  );
}

function useDeleteReply(placeId: string, voteId: string, replyId: string) {
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: () =>
      queryApi(`/places/${placeId}/votes/${voteId}/replies/${replyId}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["places", placeId] }),
  });
  return deleteCommentMutation;
}
