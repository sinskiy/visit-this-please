import { screen } from "@testing-library/react";
import customRender from "../../test/testingLibraryWrapper";
import Replies from "./Replies";

test("Renders 2 replies", async () => {
  customRender(
    <Replies
      replies={[
        { _id: "id1", text: "sinskiy", userId: "userId1" },
        { _id: "id2", text: "sinskiy", userId: "userId2" },
      ]}
      placeId="randomplaceid"
      voteId="randomvoteid"
    />
  );

  expect(screen.getAllByText("sinskiy")).toHaveLength(2);
});

test("Renders 0 replies", async () => {
  customRender(
    <Replies replies={[]} placeId="randomplaceid" voteId="randomvoteid" />
  );

  expect(screen.queryByRole("list")).toBeNull();
});
