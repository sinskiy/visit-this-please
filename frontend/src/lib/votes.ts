import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "./fetch";

export type VoteType = "UP" | "DOWN";

export interface Vote {
  _id: string;
  userId: string;
  type: VoteType;
  likes: { _id: string; userId: string }[];
  text?: string;
}

export function useVote() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ type, id }: { type: VoteType; id: string }) => {
      return mutateApi("PATCH", `/places/${id}/votes`, { type });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  return mutation;
}
