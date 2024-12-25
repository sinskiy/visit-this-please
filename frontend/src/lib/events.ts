import { FormEvent } from "react";

// onSubmit={(e) => exampleAction(handleSubmit(e))}
export function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  return formData;
}
