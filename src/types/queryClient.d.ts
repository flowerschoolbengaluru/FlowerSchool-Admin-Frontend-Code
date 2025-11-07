declare module "@/lib/queryClient" {
  // Minimal declarations to satisfy TypeScript imports in the project.
  export function apiRequest(url: string, options?: { method?: string; headers?: Record<string,string>; body?: string }): Promise<Response>;
  export const queryClient: any;
  export const getQueryFn: any;
}
