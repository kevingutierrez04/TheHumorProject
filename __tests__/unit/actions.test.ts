import { submitVote, getUserVotes, getVoteCounts } from "@/app/actions";
import { makeSequentialClient } from "../setup/supabaseMock";

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.Mock;

const mockUser = { id: "user-abc" };

describe("submitVote", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns error when user is not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSequentialClient(null, []));
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ error: "You must be logged in to vote" });
  });

  it("inserts a new vote and returns action:created when no existing vote", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        { data: null, error: null },       // .single() — no existing vote
        { data: null, error: null },       // .insert() await result
      ])
    );
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ success: true, action: "created" });
  });

  it("removes vote when clicking the same vote value (toggle off)", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        { data: { id: "v-1", vote_value: 1 }, error: null }, // existing vote, same value
        { data: null, error: null },                         // .delete() await result
      ])
    );
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ success: true, action: "removed" });
  });

  it("updates vote when changing to a different value", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        { data: { id: "v-1", vote_value: -1 }, error: null }, // existing vote, different value
        { data: null, error: null },                          // .update() await result
      ])
    );
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ success: true, action: "updated" });
  });

  it("returns DB error when insert fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        { data: null, error: null },
        { data: null, error: { message: "unique constraint violation" } },
      ])
    );
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ error: "unique constraint violation" });
  });

  it("returns DB error when delete fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        { data: { id: "v-1", vote_value: 1 }, error: null },
        { data: null, error: { message: "FK constraint" } },
      ])
    );
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ error: "FK constraint" });
  });

  it("returns DB error when update fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        { data: { id: "v-1", vote_value: -1 }, error: null },
        { data: null, error: { message: "connection timeout" } },
      ])
    );
    const result = await submitVote("cap-1", 1);
    expect(result).toEqual({ error: "connection timeout" });
  });
});

describe("getUserVotes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty object when user is not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSequentialClient(null, []));
    const result = await getUserVotes(["cap-1", "cap-2"]);
    expect(result).toEqual({});
  });

  it("returns empty object when captionIds array is empty", async () => {
    mockCreateClient.mockResolvedValue(makeSequentialClient(mockUser, []));
    const result = await getUserVotes([]);
    expect(result).toEqual({});
  });

  it("returns a map of captionId → voteValue for the authenticated user", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        {
          data: [
            { caption_id: "cap-1", vote_value: 1 },
            { caption_id: "cap-2", vote_value: -1 },
          ],
          error: null,
        },
      ])
    );
    const result = await getUserVotes(["cap-1", "cap-2"]);
    expect(result).toEqual({ "cap-1": 1, "cap-2": -1 });
  });

  it("returns empty object when the user has no votes on those captions", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [{ data: [], error: null }])
    );
    const result = await getUserVotes(["cap-1"]);
    expect(result).toEqual({});
  });
});

describe("getVoteCounts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty object without hitting the DB when captionIds is empty", async () => {
    mockCreateClient.mockResolvedValue(makeSequentialClient(mockUser, []));
    const result = await getVoteCounts([]);
    expect(result).toEqual({});
  });

  it("correctly sums vote_values per caption", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        {
          data: [
            { caption_id: "cap-1", vote_value: 1 },
            { caption_id: "cap-1", vote_value: 1 },
            { caption_id: "cap-2", vote_value: -1 },
          ],
          error: null,
        },
      ])
    );
    const result = await getVoteCounts(["cap-1", "cap-2"]);
    expect(result).toEqual({ "cap-1": 2, "cap-2": -1 });
  });

  it("returns empty object when data is null (DB error / no rows)", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [{ data: null, error: null }])
    );
    const result = await getVoteCounts(["cap-1"]);
    expect(result).toEqual({});
  });

  it("handles mixed up/down/neutral votes and returns correct net score", async () => {
    mockCreateClient.mockResolvedValue(
      makeSequentialClient(mockUser, [
        {
          data: [
            { caption_id: "cap-1", vote_value: 1 },
            { caption_id: "cap-1", vote_value: -1 },
            { caption_id: "cap-1", vote_value: 1 },
          ],
          error: null,
        },
      ])
    );
    const result = await getVoteCounts(["cap-1"]);
    expect(result).toEqual({ "cap-1": 1 });
  });
});
