type MockResult = { data: unknown; error: unknown };

function makeQueryBuilder(result: MockResult) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qb: any = {};

  for (const method of ["select", "insert", "update", "delete", "eq", "in", "order", "limit", "range"]) {
    qb[method] = jest.fn(() => qb);
  }

  qb.single = jest.fn(() => Promise.resolve(result));
  qb.then = (resolve: (v: MockResult) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  qb.catch = (reject: (e: unknown) => unknown) => Promise.resolve(result).catch(reject);

  return qb;
}

export interface MockSupabaseOptions {
  user?: object | null;
  session?: object | null;
  exchangeCodeError?: object | null;
}

export function createMockSupabaseClient(opts: MockSupabaseOptions = {}) {
  const {
    user = { id: "user-123" },
    session = { access_token: "mock-access-token" },
    exchangeCodeError = null,
  } = opts;

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
      getSession: jest.fn().mockResolvedValue({ data: { session } }),
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: exchangeCodeError }),
    },
    // Use per-call sequential responses via makeSequentialClient when needed.
    // This simple version just returns null data for all tables.
    from: jest.fn().mockImplementation(() => makeQueryBuilder({ data: null, error: null })),
  };
}

// Creates a mock client where successive calls to from() use responses in order.
// Use this when a single action hits the same table multiple times.
export function makeSequentialClient(
  user: object | null,
  callResponses: Array<{ data: unknown; error: unknown }>
) {
  let i = 0;
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
    from: jest.fn().mockImplementation(() => {
      const res = callResponses[i] ?? { data: null, error: null };
      i++;
      return makeQueryBuilder(res);
    }),
  };
}
