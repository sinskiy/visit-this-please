import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutateApi } from "./fetch";

export function useVote() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // TODO: abstract type votes if used in more than one place
    mutationFn: ({ type, id }: { type: "UP" | "DOWN"; id: string }) => {
      return mutateApi("PATCH", `/places/${id}/votes`, { type });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  return mutation;
}
