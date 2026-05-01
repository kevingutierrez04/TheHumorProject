import { getPresignedUrl, registerAndGenerateCaptions } from "@/app/upload/uploadActions";

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.Mock;

const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

const mockToken = "mock-bearer-token";

function makeSupabaseWithSession(session: object | null) {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session } }),
    },
  };
}

function makeFetchResponse(ok: boolean, body: unknown) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok,
    status: ok ? 200 : 400,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(text),
  };
}

describe("getPresignedUrl", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws 'Not authenticated' when session is absent", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseWithSession(null));
    await expect(getPresignedUrl("image/jpeg")).rejects.toThrow("Not authenticated");
  });

  it("calls the presigned-url API endpoint with the bearer token", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    mockFetch.mockResolvedValue(
      makeFetchResponse(true, {
        presignedUrl: "https://s3.example.com/upload",
        cdnUrl: "https://cdn.example.com/img.jpg",
      })
    );

    await getPresignedUrl("image/jpeg");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("generate-presigned-url"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    );
  });

  it("returns parsed JSON containing presignedUrl and cdnUrl on success", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    const payload = {
      presignedUrl: "https://s3.example.com/upload",
      cdnUrl: "https://cdn.example.com/img.jpg",
    };
    mockFetch.mockResolvedValue(makeFetchResponse(true, payload));

    const result = await getPresignedUrl("image/png");
    expect(result).toEqual(payload);
  });

  it("throws when the API returns a non-OK response", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    mockFetch.mockResolvedValue(makeFetchResponse(false, "Forbidden"));
    await expect(getPresignedUrl("image/jpeg")).rejects.toThrow(
      "Failed to get presigned URL"
    );
  });
});

describe("registerAndGenerateCaptions", () => {
  const cdnUrl = "https://cdn.example.com/img.jpg";
  beforeEach(() => jest.clearAllMocks());

  it("throws 'Not authenticated' when session is absent", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseWithSession(null));
    await expect(registerAndGenerateCaptions(cdnUrl)).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("throws when image registration API call fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    mockFetch.mockResolvedValue(makeFetchResponse(false, "Internal Server Error"));
    await expect(registerAndGenerateCaptions(cdnUrl)).rejects.toThrow(
      "Failed to register image"
    );
  });

  it("throws when caption generation API call fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    mockFetch
      .mockResolvedValueOnce(makeFetchResponse(true, { imageId: "img-123" })) // register OK
      .mockResolvedValueOnce(makeFetchResponse(false, "Service Unavailable")); // generate fails
    await expect(registerAndGenerateCaptions(cdnUrl)).rejects.toThrow(
      "Failed to generate captions"
    );
  });

  it("returns the captions array on full success", async () => {
    const captions = [
      { id: "cap-1", content: "Why did the image cross the road?" },
      { id: "cap-2", content: "To get to the other pixel." },
    ];
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    mockFetch
      .mockResolvedValueOnce(makeFetchResponse(true, { imageId: "img-123" }))
      .mockResolvedValueOnce(makeFetchResponse(true, captions));

    const result = await registerAndGenerateCaptions(cdnUrl);
    expect(result).toEqual(captions);
  });

  it("passes the cdnUrl to the image registration endpoint", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseWithSession({ access_token: mockToken })
    );
    mockFetch
      .mockResolvedValueOnce(makeFetchResponse(true, { imageId: "img-999" }))
      .mockResolvedValueOnce(makeFetchResponse(true, []));

    await registerAndGenerateCaptions(cdnUrl);

    const [, registerOptions] = mockFetch.mock.calls[0];
    const body = JSON.parse(registerOptions.body);
    expect(body.imageUrl).toBe(cdnUrl);
  });
});
