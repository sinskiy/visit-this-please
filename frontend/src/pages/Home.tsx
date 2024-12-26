import { useContext } from "react";
import { UserContext } from "../user";

export default function Home() {
  const { user } = useContext(UserContext);
  return <p>hello, {user?.username ?? "world"}</p>;
}
