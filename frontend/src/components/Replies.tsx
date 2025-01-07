import commentScheme, { CommentScheme } from "@/lib/comments";
import { mutateApi, queryApi } from "@/lib/fetch";
import type { Reply } from "@/lib/votes";
import Card from "@/ui/Card";
import Form from "@/ui/Form";
import InputField from "@/ui/InputField";
import { UserContext } from "@/user";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useLocation } from "react-router";
import styled from "styled-components";
import FetchUsername from "./FetchUsername";
import IconButton from "@/ui/IconButton";
import Delete from "@/assets/delete.svg";

export default function Replies({
  replies,
  placeId,
  voteId,
}: {
  replies: Reply[];
  placeId: string;
  voteId: string;
}) {
  const { user } = useContext(UserContext);
  return (
    <>
      {replies.length > 0 ? (
        <ReplyList role="list">
          {replies.map((reply) => (
            <li key={reply._id}>
              <Reply placeId={placeId} reply={reply} voteId={voteId} />
            </li>
          ))}
        </ReplyList>
      ) : (
        <p>
          <i>no replies</i>
        </p>
      )}
      {user && <ReplyForm placeId={placeId} voteId={voteId} />}
    </>
  );
}

const ReplyList = styled.ul`
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

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
    resolver: valibotResolver(commentScheme),
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      mutation={mutation}
      customButton={Button}
      $row={true}
    >
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

  const location = useLocation();

  const deleteReplyMutation = useDeleteReply(placeId, voteId, reply._id);

  return (
    <Card
      $layer={location.hash.includes(`reply-${reply._id}`) ? "highest" : "high"}
    >
      <ReplyFirstRow>
        <p id={`reply-${reply._id}`}>
          <b>{reply.text}</b> by <FetchUsername userId={reply.userId} /> | to{" "}
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
          <IconButton
            disabled={deleteReplyMutation.isPending}
            onClick={() => deleteReplyMutation.mutate()}
            aria-label="delete"
          >
            <img src={Delete} width={24} height={24} alt="" />
          </IconButton>
        )}
      </ReplyFirstRow>
      {user && (
        <ReplyForm
          placeId={placeId}
          voteId={voteId}
          replyId={reply._id}
          replyUserId={reply.userId}
        />
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

const ReplyFirstRow = styled.div`
  display: flex;
  gap: 16px;
`;

const Button = styled.button`
  height: fit-content;
  align-self: center;
`;
