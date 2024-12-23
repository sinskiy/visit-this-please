import { useEffect, useState } from "react";
import env from "./env";

export default function App() {
  const [data, setData] = useState();
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(env.VITE_API_URL);
      const json = await response.json();
      setData(json);
    }

    fetchData();
  }, []);

  console.log(data);

  return <>{data?.hello}</>;
}
