import { InferOutput, nonEmpty, object, pipe, string } from "valibot";

const commentScheme = object({ text: pipe(string(), nonEmpty()) });
export default commentScheme;
export type CommentScheme = InferOutput<typeof commentScheme>;
