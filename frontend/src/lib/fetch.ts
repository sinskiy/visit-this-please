import env from "./env";

export async function queryApi(path: string, options: RequestInit) {
  const response = await fetch(env.VITE_API_URL + path, options);

  // json call may fail if server is shut down, for example
  try {
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json);
    } else {
      return json;
    }
  } catch {
    throw new Error(response.statusText);
  }
}

// put is dangerous and i prefer not to use it, don't add for now
type HttpMutateMethod = "POST" | "PATCH";

export async function mutateApi(
  method: HttpMutateMethod,
  path: string,
  body: object,
  options?: RequestInit
) {
  return queryApi(path, {
    ...options,
    method,
    headers: { ...options?.headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
