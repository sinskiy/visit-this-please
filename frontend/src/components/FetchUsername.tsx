import { useContext, useState } from "react";
import { UserContext } from "../user";
import { useQuery } from "@tanstack/react-query";
import { queryApi } from "../lib/fetch";
import styled from "styled-components";

const Button = styled.button`
  margin-left: 1rem;
`;

export default function FetchUsername({ userId }: { userId: string }) {
  const { user } = useContext(UserContext);
  const isMine = user?.id === userId;

  const { setDoFetchUsername, fetchUsernameQuery } = useFetchUsername(userId);

  return (
    <>
      {isMine ? (
        user?.username
      ) : fetchUsernameQuery.isLoading ? (
        <i>loading username</i>
      ) : fetchUsernameQuery.isError ? (
        fetchUsernameQuery.error.message
      ) : (
        fetchUsernameQuery.data?.username ?? userId
      )}
      {!isMine && (
        <Button
          onClick={() => setDoFetchUsername(true)}
          disabled={
            fetchUsernameQuery.data && "username" in fetchUsernameQuery.data
          }
        >
          fetch username
        </Button>
      )}
    </>
  );
}

function useFetchUsername(userId: string) {
  const [doFetchUsername, setDoFetchUsername] = useState(false);
  const fetchUsernameQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => queryApi(`/users/${userId}`),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: doFetchUsername,
  });
  return { fetchUsernameQuery, setDoFetchUsername };
}
