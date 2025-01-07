import { SubmitHandler, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useContext, useEffect, useMemo, useState } from "react";
import Form from "@/ui/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "@/lib/fetch";
import type { Like, Vote } from "@/lib/votes";
import Sort from "@/components/SortOrFilter";
import { usePlaceSort } from "@/lib/sort";
import { useSearchParams } from "react-router";
import FetchUsername from "@/components/FetchUsername";
import CheckboxField from "@/ui/CheckboxField";
import styled from "styled-components";
import Card from "@/ui/Card";
import IconButton from "@/ui/IconButton";
import LikeFilled from "@/assets/like-filled.svg";
import LikeIcon from "@/assets/like.svg";
import Delete from "@/assets/delete.svg";
import { UserContext } from "@/user";
import commentScheme, { CommentScheme } from "@/lib/comments";
import Replies from "./Replies";

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
        $isUser={!!user}
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

const StyledComments = styled.div`
  margin-top: 48px;
`;

const CommentList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledSort = styled(Sort)`
  margin-top: ${(props) => (props.$isUser ? "32px" : 0)};
`;

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
    resolver: valibotResolver(commentScheme),
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
      <Textarea
        id="comment"
        cols={20}
        rows={4}
        {...register("text")}
        defaultValue={voteText}
      ></Textarea>
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

const Textarea = styled.textarea`
  background-color: var(--surface-container-highest);
  color: var(--on-surface);
  border: none;
  outline: 1px solid var(--outline);
  border-radius: 4px;
  &:focus {
    outline: 2px solid var(--primary);
  }
`;

function Comment({ placeId, vote }: { placeId: string; vote: Vote }) {
  const { user } = useContext(UserContext);
  const isMyComment = user?.id === vote.userId;

  const deleteCommentMutation = useDeleteComment(placeId, vote._id);

  const { likeMutation, isLiked } = useLike(placeId, vote._id, vote.likes);

  const [showReplies, setShowReplies] = useState(false);

  return (
    <Card>
      <p id={`comment-${vote._id}`}>
        <b>{vote.text}</b> by <FetchUsername userId={vote.userId} />
      </p>
      <CommentButtonsWrapper>
        {user && (
          <IconButton
            disabled={likeMutation.isPending}
            onClick={() => likeMutation.mutate()}
            aria-label={isLiked ? "remove like" : "add like"}
          >
            <img
              src={isLiked ? LikeFilled : LikeIcon}
              width={24}
              height={24}
              alt=""
            />
            {vote.likes.length}
          </IconButton>
        )}
        {isMyComment && (
          <IconButton
            disabled={deleteCommentMutation.isPending}
            onClick={() => deleteCommentMutation.mutate()}
            aria-label="delete"
          >
            <img src={Delete} width={24} height={24} alt="" />
          </IconButton>
        )}
      </CommentButtonsWrapper>
      {deleteCommentMutation.isError && (
        <p>{deleteCommentMutation.error.message}</p>
      )}
      {likeMutation.isError && <p>{likeMutation.error.message}</p>}
      <ShowRepliesCheckbox
        type="checkbox"
        id={`show-replies-${vote._id}`}
        label="show replies"
        checked={showReplies}
        onChange={(e) => setShowReplies(e.currentTarget.checked)}
      />
      {showReplies && (
        <Replies replies={vote.replies} placeId={placeId} voteId={vote._id} />
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

const CommentButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ShowRepliesCheckbox = styled(CheckboxField)`
  margin-bottom: 16px;
`;

const SORT_OPTIONS = [
  "likes",
  "last-added",
  "upvotes-first",
  "downvotes-first",
];
