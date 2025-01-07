import { screen } from "@testing-library/react";
import Comments from "@/components/Comments";
import customRender from "../../test/testingLibraryWrapper";

test("Renders 2 comments", async () => {
  customRender(
    <Comments
      votes={[
        {
          _id: "id1",
          likes: [],
          replies: [],
          type: "DOWN",
          userId: "userId1",
          text: "sinskiy",
        },
        {
          _id: "id2",
          likes: [],
          replies: [],
          type: "DOWN",
          userId: "userId2",
          text: "sinskiy",
        },
      ]}
      placeId="randomplaceid"
      voteId={undefined}
      voteText={undefined}
    />
  );

  expect(screen.getAllByText("sinskiy")).toHaveLength(2);
});

test("Renders 0 comments", async () => {
  customRender(
    <Comments
      votes={[]}
      placeId="randomplaceid"
      voteId={undefined}
      voteText={undefined}
    />
  );

  expect(screen.queryByRole("list")).toBeNull();
});
