# Copilot Instructions for AI Agents

## Project Overview
- This is a Vite + React + TypeScript web application for E-Commerce and Flower School management.
- UI is built with shadcn-ui and styled using Tailwind CSS.
- The project is structured for modularity: `src/components` for UI, `src/pages` for routes/views, `src/lib` for utilities and API logic, and `src/hooks` for custom React hooks.

## Key Workflows
- **Local Development:**
  - Install dependencies: `npm i`
  - Start dev server: `npm run dev`
- **Deployment:**
  - Use Lovable platform for publishing and domain management.
  - See README for Lovable integration details.

## Architectural Patterns
- **Component Structure:**
  - UI components are in `src/components` and `src/components/ui` (shadcn-ui).
  - Pages are in `src/pages`, each representing a route.
  - Shared logic (API, auth, utilities) is in `src/lib`.
- **State & Data Flow:**
  - React Query is used for data fetching/caching (see `src/lib/queryClient.ts`).
  - Custom hooks in `src/hooks` encapsulate reusable logic.
- **Auth:**
  - Auth forms and protected routes are in `src/components/auth`.
  - API logic for auth is in `src/lib/auth.ts`.

## Project-Specific Conventions
- Use shadcn-ui primitives for new UI elements (see `src/components/ui`).
- Use Tailwind CSS for styling; avoid inline styles.
- Page-level logic goes in `src/pages`, not in components.
- API calls should use the helpers in `src/lib/api.ts`.
- Use custom hooks for cross-cutting concerns (e.g., `use-toast`, `user-auth`).

## Integration Points
- External payments via Razorpay (`src/lib/razorpay.ts`).
- SEO handled in `src/components/SEO.tsx`.
- Nginx config for deployment in `nginx.conf`.
- Dockerfile provided for containerization.

## Examples
- To add a new page: create a file in `src/pages`, add route logic in `main.tsx`.
- To add a new UI component: use shadcn-ui pattern in `src/components/ui`.
- To fetch data: use React Query via helpers in `src/lib/queryClient.ts`.

## References
- See `README.md` for setup, Lovable integration, and deployment.
- See `src/lib` for API/auth/payment logic.
- See `src/components/ui` for UI conventions.

---
For unclear or missing conventions, ask for clarification or review recent code in the referenced directories.
