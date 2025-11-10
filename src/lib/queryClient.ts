import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const raw = (await res.text()) || res.statusText || '';

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const userMessage = (parsed && (parsed.message || parsed.error)) || raw || `HTTP ${res.status}`;

    const err: any = new Error(userMessage);
    err.response = {
      status: res.status,
      rawText: raw,
      data: parsed,
      json: async () => parsed,
      text: async () => raw,
    };
    throw err;
  }
}

const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (path.startsWith('/api')) {
    return `${baseUrl}${path}`;
  }
  return path;
};

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<Response> {
  // Diagnostic: trace unexpected sign-in requests
  try {
    if (typeof url === 'string' && url.includes('/api/auth/signin')) {
      // Print a concise message and a stack trace to identify the caller
      // This is temporary diagnostic logging to help find why POST /api/auth/signin
      // is triggered on page refresh. Remove once root cause is found.
      // eslint-disable-next-line no-console
      console.log('[diag] apiRequest: /api/auth/signin called — options:', { method: options?.method, bodySnippet: options?.body ? options.body.slice(0, 100) : undefined });
      // eslint-disable-next-line no-console
      console.trace();
    }
  } catch (e) {
    // ignore diagnostic errors
  }
  const defaultHeaders: Record<string, string> = {};
  if (options?.body) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const fullUrl = getApiUrl(url);

  const res = await fetch(fullUrl, {
    method: options?.method || "GET",
    headers: { ...defaultHeaders, ...options?.headers },
    body: options?.body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior; }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const url = getApiUrl(queryKey.join("/") as string);
      const res = await fetch(url, { credentials: "include" });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as any;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
