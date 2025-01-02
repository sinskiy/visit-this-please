import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useMemo, useState } from "react";
import Form from "../ui/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "../lib/fetch";
import { object, string, infer as inferType } from "zod";
import { UserContext } from "../user";
import { type Reply, Vote } from "../lib/votes";
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
          (comment) =>
            comment.text && (
              <li key={comment.userId}>
                <Comment placeId={placeId} comment={comment} />
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

function Comment({ placeId, comment }: { placeId: string; comment: Vote }) {
  const { user } = useContext(UserContext);
  const isMyComment = user?.id === comment.userId;

  const deleteCommentMutation = useDeleteComment(placeId, comment);

  const { likeMutation, isLiked } = useLike(placeId, comment);

  const [showReplies, setShowReplies] = useState(false);

  return (
    <>
      {comment.text} by <FetchUsername userId={comment.userId} />
      <p id={`comment-${comment._id}`}>
        {comment.likes.length} like{comment.likes.length !== 1 && "s"}
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
          <ReplyForm placeId={placeId} voteId={comment._id} />
          <ul>
            {comment.replies.map((reply) => (
              <li key={reply._id}>
                <Reply reply={reply} placeId={placeId} voteId={comment._id} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function useDeleteComment(id: string, comment: Vote) {
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: () =>
      mutateApi("PATCH", `/places/${id}/votes/${comment._id}`, { text: "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places", id] });
      queryClient.invalidateQueries({
        queryKey: ["places", { sort: "comments" }],
      });
    },
  });
  return deleteCommentMutation;
}

function useLike(id: string, comment: Vote) {
  const { user } = useContext(UserContext);

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () =>
      mutateApi("PATCH", `/places/${id}/votes/${comment._id}/likes`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["places", id] }),
  });

  const isLiked = useMemo(
    () => comment.likes.findIndex((like) => like.userId === user?.id) !== -1,
    [comment]
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
      <ReplyForm
        placeId={placeId}
        voteId={voteId}
        replyId={reply._id}
        replyUserId={reply.userId}
      />
    </>
  );
}
