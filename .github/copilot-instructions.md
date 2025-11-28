

# Copilot Instructions for AI Agents — Flower School E-Commerce Frontend

## Project Architecture
- **Vite + React + TypeScript** SPA for e-commerce and course management
- **UI**: Built with shadcn-ui primitives (`src/components/ui`), styled using Tailwind CSS
- **Structure**:
  - `src/pages`: Route-level views, page logic only
  - `src/components`: Shared UI/features; `ui/` for shadcn-ui
  - `src/lib`: API, auth, payment, utilities
  - `src/hooks`: Custom hooks for cross-cutting logic

## Data Flow & Patterns
- **API calls**: Use `src/lib/api.ts` helpers and React Query (`src/lib/queryClient.ts`) for all server communication
- **Auth**: Forms and protected routes in `src/components/auth`; logic in `src/lib/auth.ts` and `src/hooks/user-auth.tsx`
- **State**: Prefer React Query for server state; use local state for UI interactions
- **Product/category management**: See `src/pages/Admin.tsx` for dynamic forms, category mapping, image upload, and discount logic

## Developer Workflows
- Install dependencies: `npm i`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Deploy: Lovable platform (see `README.md` for integration, domain setup)
- Containerization: See `Dockerfile` and `nginx.conf` for deployment config

## Project-Specific Conventions
- Use shadcn-ui primitives for new UI (`src/components/ui`)
- Style exclusively with Tailwind CSS classes (no inline styles)
- Page logic must reside in `src/pages`, not in components
- API calls must use `src/lib/api.ts` helpers
- Use custom hooks for reusable/cross-cutting logic
- Discount logic: Product form in `Admin.tsx` auto-calculates and previews discounts

## Integration Points
- **Payments**: Razorpay integration in `src/lib/razorpay.ts`
- **SEO**: Managed in `src/components/SEO.tsx`
- **Nginx/Docker**: See `nginx.conf`, `Dockerfile` for deployment

## Key Examples & Patterns
- Add a page: Create in `src/pages`, add route in `main.tsx`
- Add UI: Use shadcn-ui pattern in `src/components/ui`
- Fetch data: Use React Query via `src/lib/queryClient.ts`
- Product CRUD: See `Admin.tsx` for forms, image upload, category/discount logic

## References
- `README.md`: Setup, Lovable integration, deployment
- `src/lib`: API/auth/payment logic
- `src/components/ui`: UI conventions
- `src/pages/Admin.tsx`: Product/category/discount/image upload patterns

---
If any section is unclear or missing, ask for clarification or review recent code in referenced directories. Please provide feedback to improve these instructions.
