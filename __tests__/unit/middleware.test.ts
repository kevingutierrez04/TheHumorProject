import { middleware } from "@/app/middleware";
import { NextRequest } from "next/server";

jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createServerClient } = require("@supabase/ssr");
const mockCreateServerClient = createServerClient as jest.Mock;

function setUser(user: object | null) {
  mockCreateServerClient.mockReturnValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
  });
}

function redirectLocation(res: Response) {
  return res.headers.get("location") ?? "";
}

describe("middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects unauthenticated user from / to /login", async () => {
    setUser(null);
    const req = new NextRequest("http://localhost/");
    const res = await middleware(req);
    expect(redirectLocation(res)).toMatch(/\/login$/);
  });

  it("redirects unauthenticated user from /upload to /login", async () => {
    setUser(null);
    const req = new NextRequest("http://localhost/upload");
    const res = await middleware(req);
    expect(redirectLocation(res)).toMatch(/\/login$/);
  });

  it("redirects authenticated user from /login to /", async () => {
    setUser({ id: "user-123" });
    const req = new NextRequest("http://localhost/login");
    const res = await middleware(req);
    expect(redirectLocation(res)).toMatch(/\/$/) ;
  });

  it("passes through authenticated requests to /", async () => {
    setUser({ id: "user-123" });
    const req = new NextRequest("http://localhost/");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(redirectLocation(res)).toBe("");
  });

  it("passes through authenticated requests to /upload", async () => {
    setUser({ id: "user-123" });
    const req = new NextRequest("http://localhost/upload");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(redirectLocation(res)).toBe("");
  });

  it("passes through unauthenticated requests to /login", async () => {
    setUser(null);
    const req = new NextRequest("http://localhost/login");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(redirectLocation(res)).toBe("");
  });

  it("passes through unauthenticated requests to /auth/callback (not a protected route)", async () => {
    setUser(null);
    const req = new NextRequest("http://localhost/auth/callback");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(redirectLocation(res)).toBe("");
  });
});
