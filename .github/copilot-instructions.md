# Copilot Instructions for AI Agents

## Project Overview
- Vite + React + TypeScript web app for E-Commerce and Flower School management.
- UI: shadcn-ui primitives, Tailwind CSS for styling.
- Modular structure: `src/components` (UI), `src/pages` (routes/views), `src/lib` (API/auth/utils), `src/hooks` (custom hooks).

## Architecture & Data Flow
- **Pages** in `src/pages` define route-level logic and views.
- **UI components** in `src/components` and `src/components/ui` (shadcn-ui) are reused across pages.
- **API calls** use helpers in `src/lib/api.ts` and React Query (`src/lib/queryClient.ts`) for data fetching/caching.
- **Auth**: Forms and protected routes in `src/components/auth`, logic in `src/lib/auth.ts` and `src/hooks/user-auth.tsx`.
- **Custom hooks** in `src/hooks` encapsulate reusable logic (e.g., `use-toast`, `user-auth`).
- **State**: Prefer React Query for server state, local state for UI interactions.

## Developer Workflows
- **Install dependencies**: `npm i`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Deployment**: Use Lovable platform (see `README.md` for integration and domain setup).
- **Containerization**: See `Dockerfile` and `nginx.conf` for deployment config.

## Project-Specific Conventions
- Use shadcn-ui primitives for new UI (`src/components/ui`).
- Style with Tailwind CSS classes, avoid inline styles.
- Page logic belongs in `src/pages`, not in components.
- API calls must use `src/lib/api.ts` helpers.
- Use custom hooks for cross-cutting concerns.
- Product/category management: See `src/pages/Admin.tsx` for patterns (dynamic forms, category mapping, image upload logic).
- Discount logic: See product form in `Admin.tsx` for auto-calculation and preview patterns.

## Integration Points
- **Payments**: Razorpay integration in `src/lib/razorpay.ts`.
- **SEO**: Handled in `src/components/SEO.tsx`.
- **Nginx/Docker**: See `nginx.conf`, `Dockerfile` for deployment.

## Examples
- Add a page: Create in `src/pages`, add route in `main.tsx`.
- Add UI: Use shadcn-ui pattern in `src/components/ui`.
- Fetch data: Use React Query via `src/lib/queryClient.ts`.
- Product CRUD: See `Admin.tsx` for form, image upload, and category logic.

## References
- `README.md`: Setup, Lovable integration, deployment.
- `src/lib`: API/auth/payment logic.
- `src/components/ui`: UI conventions.
- `src/pages/Admin.tsx`: Product management, category, discount, and image upload patterns.

---
If conventions are unclear or missing, ask for clarification or review recent code in referenced directories. Please provide feedback if any section is incomplete or unclear.
