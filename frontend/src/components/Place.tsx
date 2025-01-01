import { getFormattedPlace, PlaceById, type Place } from "../lib/places";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../user";
import { useVote, Vote } from "../lib/votes";
import Form from "../ui/Form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutateApi, queryApi } from "../lib/fetch";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { infer as inferType, object, string } from "zod";

export default function Place({
  place,
  comments = false,
}: {
  place: Place | PlaceById;
  comments?: boolean;
}) {
  const { user } = useContext(UserContext);
  return (
    <>
      <p>{getFormattedPlace(place)}</p>
      <Votes place={place} />
      {"votes" in place && user && comments && <CommentForm place={place} />}
      {"votes" in place && comments && (
        <ul>
          {place.votes.map(
            (comment) =>
              comment.text && (
                <li key={comment.userId}>
                  <Comment id={place._id} comment={comment} />
                </li>
              )
          )}
        </ul>
      )}
    </>
  );
}

function Votes({ place }: { place: Place }) {
  const { isPending: isVoteLoading, mutate } = useVote();
  const { user } = useContext(UserContext);

  return (
    <>
      <label htmlFor={`vote-${place._id}-up`}>up {place.up}</label>
      <input
        type="radio"
        name={`vote-${place._id}`}
        id={`vote-${place._id}-up`}
        onChange={() => mutate({ type: "UP", id: place._id })}
        disabled={!user || isVoteLoading}
        checked={place.voted === "UP"}
      />
      <label htmlFor={`vote-${place._id}-down`}>down {place.down}</label>
      <input
        type="radio"
        name={`vote-${place._id}`}
        id={`vote-${place._id}-down`}
        onChange={() => mutate({ type: "DOWN", id: place._id })}
        disabled={!user || isVoteLoading}
        checked={place.voted === "DOWN"}
      />
    </>
  );
}

function CommentForm({ place }: { place: PlaceById }) {
  const { mutation, onSubmit } = useComment(place._id, place.userVote?._id);

  const { register, handleSubmit, reset } = useForm<CommentScheme>({
    resolver: zodResolver(commentScheme),
  });

  useEffect(() => {
    if (!place.userVote?.text) {
      reset();
    }
  }, [place.userVote?.text]);

  return (
    <Form
      mutation={mutation}
      onSubmit={handleSubmit(onSubmit)}
      disabled={!place.userVote}
    >
      <textarea
        id="comment"
        cols={30}
        rows={5}
        {...register("text")}
        defaultValue={place.userVote?.text}
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

function Comment({ id, comment }: { id: string; comment: Vote }) {
  const { user } = useContext(UserContext);
  const isMyComment = user?.id === comment.userId;

  const { fetchUsernameQuery, setDoFetchUsername } = useFetchUsername(comment);

  const deleteCommentMutation = useDeleteComment(id, comment);

  const { likeMutation, isLiked } = useLike(id, comment);

  return (
    <>
      {comment.text} by{" "}
      {isMyComment
        ? user?.username
        : fetchUsernameQuery.data?.username ?? comment.userId}
      {!isMyComment && (
        <button
          onClick={() => setDoFetchUsername(true)}
          disabled={
            fetchUsernameQuery.data && "username" in fetchUsernameQuery.data
          }
        >
          fetch username
        </button>
      )}
      <p>
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
      {fetchUsernameQuery.isLoading ? (
        <p>loading username</p>
      ) : (
        fetchUsernameQuery.isError && <p>{fetchUsernameQuery.error.message}</p>
      )}
    </>
  );
}

function useFetchUsername(comment: Vote) {
  const [doFetchUsername, setDoFetchUsername] = useState(false);
  const fetchUsernameQuery = useQuery({
    queryKey: ["users", comment.userId],
    queryFn: () => queryApi(`/users/${comment.userId}`),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: doFetchUsername,
  });
  return { fetchUsernameQuery, setDoFetchUsername };
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
