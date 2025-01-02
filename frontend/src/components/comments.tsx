import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useMemo, useState } from "react";
import Form from "../ui/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi, queryApi } from "../lib/fetch";
import { object, string, infer as inferType } from "zod";
import { UserContext } from "../user";
import { Like, type Reply, Vote } from "../lib/votes";
import Sort from "./Sort";
import { usePlaceSort } from "../lib/sort";
import { useSearchParams } from "react-router";
import FetchUsername from "./FetchUsername";

const SORT_OPTIONS = [
  "likes",
  "last-added",
  "upvotes-first",
  "downvotes-first",
];

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

  return (
    <>
      {user && (
        <CommentForm placeId={placeId} voteId={voteId} voteText={voteText} />
      )}
      <Sort types={SORT_OPTIONS} sort={sort} setSort={setSort} />
      <ul>
        {votes.map(
          (vote) =>
            vote.text && (
              <li key={vote.userId}>
                <Comment placeId={placeId} vote={vote} />
              </li>
            )
        )}
      </ul>
    </>
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
      <textarea
        id="comment"
        cols={30}
        rows={5}
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

function Comment({ placeId, vote }: { placeId: string; vote: Vote }) {
  const { user } = useContext(UserContext);
  const isMyComment = user?.id === vote.userId;

  const deleteCommentMutation = useDeleteComment(placeId, vote._id);

  const { likeMutation, isLiked } = useLike(placeId, vote._id, vote.likes);

  const [showReplies, setShowReplies] = useState(false);

  return (
    <>
      {vote.text} by <FetchUsername userId={vote.userId} />
      <p id={`comment-${vote._id}`}>
        {vote.likes.length} like{vote.likes.length !== 1 && "s"}
      </p>
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
      {deleteCommentMutation.isError && (
        <p>{deleteCommentMutation.error.message}</p>
      )}
      {likeMutation.isError && <p>{likeMutation.error.message}</p>}
      <input
        type="checkbox"
        name="show-replies"
        id="show-replies"
        checked={showReplies}
        onChange={(e) => setShowReplies(e.currentTarget.checked)}
      />
      <label htmlFor="show-replies">show replies</label>
      {showReplies && (
        <>
          <ul>
            {vote.replies.map((reply) => (
              <li key={reply._id}>
                <Reply placeId={placeId} reply={reply} voteId={vote._id} />
              </li>
            ))}
          </ul>
          <ReplyForm placeId={placeId} voteId={vote._id} />
        </>
      )}
    </>
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
      <input type="text" id="reply" {...register("text")} />
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
    <>
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
    </>
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
