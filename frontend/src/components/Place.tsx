import { getFormattedPlace, PlaceById, Vote, type Place } from "../lib/places";
import { useContext } from "react";
import { UserContext } from "../user";
import { useVote } from "../lib/votes";
import Form from "../ui/Form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "../lib/fetch";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { infer as inferType, object, string } from "zod";

export default function Place({
  place,
  comments = false,
}: {
  place: PlaceById;
  comments?: boolean;
}) {
  const { user } = useContext(UserContext);
  return (
    <>
      <p>{getFormattedPlace(place)}</p>
      <Votes place={place} />
      {user && comments && <CommentForm place={place} />}
      {comments && <Comments comments={place.votes} />}
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

  const { register, handleSubmit } = useForm<CommentScheme>({
    resolver: zodResolver(commentScheme),
  });

  return (
    <Form mutation={mutation} onSubmit={handleSubmit(onSubmit)}>
      <textarea
        id="comment"
        cols={30}
        rows={5}
        {...register("text")}
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["places", id] }),
  });

  return { mutation, onSubmit };
}

const commentScheme = object({ text: string().min(1) });
type CommentScheme = inferType<typeof commentScheme>;

// TODO: better type
function Comments({ comments }: { comments: Vote[] }) {
  console.log(comments);
  return (
    <ul>
      {comments.map(
        (comment) =>
          comment.text && (
            <li key={comment.userId}>
              {comment.text} by {comment.userId}
            </li>
          )
      )}
    </ul>
  );
}
