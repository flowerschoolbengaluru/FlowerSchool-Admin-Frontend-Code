
# Copilot Instructions for AI Agents

## Project Overview
- Vite + React + TypeScript web app for E-Commerce and Flower School management
- UI: shadcn-ui primitives in `src/components/ui`, styled with Tailwind CSS
- Modular structure: 
	- `src/pages`: route-level views and logic
	- `src/components`: shared UI and features
	- `src/lib`: API, auth, payment, and utilities
	- `src/hooks`: custom hooks for reusable logic

## Architecture & Data Flow
- **Pages** (`src/pages`): Each file is a route/view, handles page-level logic
- **UI Components** (`src/components`, `src/components/ui`): Reusable, shadcn-ui based, styled with Tailwind
- **API Calls**: Use helpers in `src/lib/api.ts` and React Query (`src/lib/queryClient.ts`) for all server communication
- **Auth**: Forms and protected routes in `src/components/auth`; logic in `src/lib/auth.ts` and `src/hooks/user-auth.tsx`
- **Custom Hooks**: Encapsulate cross-cutting logic (e.g., `use-toast`, `user-auth`)
- **State Management**: Prefer React Query for server state, local state for UI interactions

## Developer Workflows
- Install dependencies: `npm i`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Deployment: Lovable platform (see `README.md` for integration, domain setup)
- Containerization: See `Dockerfile` and `nginx.conf` for deployment config

## Project-Specific Conventions
- Use shadcn-ui primitives for new UI (`src/components/ui`)
- Style with Tailwind CSS classes only (no inline styles)
- Page logic must be in `src/pages`, not in components
- API calls must use `src/lib/api.ts` helpers
- Use custom hooks for cross-cutting concerns
- Product/category management: See `src/pages/Admin.tsx` for dynamic forms, category mapping, image upload
- Discount logic: See product form in `Admin.tsx` for auto-calculation and preview

## Integration Points
- Payments: Razorpay integration in `src/lib/razorpay.ts`
- SEO: Handled in `src/components/SEO.tsx`
- Nginx/Docker: See `nginx.conf`, `Dockerfile` for deployment

## Examples & Patterns
- Add a page: Create in `src/pages`, add route in `main.tsx`
- Add UI: Use shadcn-ui pattern in `src/components/ui`
- Fetch data: Use React Query via `src/lib/queryClient.ts`
- Product CRUD: See `Admin.tsx` for form, image upload, and category logic

## References
- `README.md`: Setup, Lovable integration, deployment
- `src/lib`: API/auth/payment logic
- `src/components/ui`: UI conventions
- `src/pages/Admin.tsx`: Product management, category, discount, and image upload patterns

---
If conventions are unclear or missing, ask for clarification or review recent code in referenced directories. Please provide feedback if any section is incomplete or unclear.
