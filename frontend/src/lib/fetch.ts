export async function queryApi(path: string, options?: RequestInit) {
  const response = await fetch(process.env.API_URL + path, options);

  // to update user to null on log out
  if (!response.ok) {
    if (!response.headers.get("Content-Type")?.includes("json")) {
      throw new Error(response.statusText);
    }

    const json = await response.json();
    if (!("error" in json)) {
      throw new Error(response.statusText);
    }

    throw new Error(json.error);
  }

  const json = await response.json();
  return json;
}

// put is dangerous and i prefer not to use it, don't add for now
type HttpMutateMethod = "POST" | "PATCH";

export async function mutateApi(
  method: HttpMutateMethod,
  path: string,
  body?: object,
  options?: RequestInit
) {
  return queryApi(path, {
    ...options,
    method,
    credentials: "include",
    headers: { ...options?.headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
