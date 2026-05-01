import { GET } from "@/app/auth/callback/route";

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.Mock;

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/auth/callback");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
}

function redirectLocation(res: Response) {
  return res.headers.get("location") ?? "";
}

function makeSupabase(exchangeError: object | null = null) {
  return {
    auth: {
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: exchangeError }),
    },
  };
}

describe("GET /auth/callback", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects to /login when no code query param is present", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase());
    const res = await GET(makeRequest({}));
    expect(redirectLocation(res)).toBe("http://localhost/login");
  });

  it("redirects to / (home) when code exchange succeeds", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    const res = await GET(makeRequest({ code: "valid-oauth-code" }));
    expect(redirectLocation(res)).toBe("http://localhost/");
  });

  it("redirects to /login when code exchange returns an error", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ message: "invalid grant" })
    );
    const res = await GET(makeRequest({ code: "bad-code" }));
    expect(redirectLocation(res)).toBe("http://localhost/login");
  });

  it("redirects to /login when code is an empty string", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase());
    const res = await GET(makeRequest({ code: "" }));
    // Empty string is falsy — behaves the same as missing code
    expect(redirectLocation(res)).toBe("http://localhost/login");
  });
});
