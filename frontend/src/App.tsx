import { useEffect, useState } from "react";
import env from "./env";

export default function App() {
  const [data, setData] = useState<undefined | { hello: string }>();
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(env.VITE_API_URL);
      const json = await response.json();
      setData(json);
    }

    fetchData();
  }, []);

  return <>{data?.hello}</>;
}
