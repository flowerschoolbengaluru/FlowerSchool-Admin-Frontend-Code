

# Copilot Instructions for AI Agents — Flower School E-Commerce Frontend

## Architecture Overview
- **Vite + React + TypeScript** SPA for e-commerce and course management
- **UI**: Built with shadcn-ui primitives (`src/components/ui`), styled using Tailwind CSS
- **Directory Structure**:
  - `src/pages`: Route-level views and page logic (no business logic in components)
  - `src/components`: Shared UI/features; `ui/` for shadcn-ui-based primitives
  - `src/lib`: API helpers, authentication, payment, and utilities
  - `src/hooks`: Custom hooks for cross-cutting logic

## Data Flow & Patterns
- **API calls**: Always use `src/lib/api.ts` helpers and React Query (`src/lib/queryClient.ts`) for server communication. Do not call fetch/axios directly in components.
- **Authentication**: Forms and protected routes in `src/components/auth`; logic in `src/lib/auth.ts` and `src/hooks/user-auth.tsx`.
- **State Management**: Use React Query for server state; use local state only for UI interactions.
- **Product & Category Management**: See `src/pages/Admin.tsx` for dynamic forms, category mapping, image upload, and discount logic. Discount preview is auto-calculated in the product form.

## Developer Workflows
- Install dependencies: `npm i`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Deploy: Lovable platform (see `README.md` for integration, domain setup)
- Containerization: See `Dockerfile` and `nginx.conf` for deployment config

## Project-Specific Conventions
- Use shadcn-ui primitives for all new UI (`src/components/ui`)
- Style exclusively with Tailwind CSS classes (no inline styles)
- Page logic must reside in `src/pages`, not in components
- API calls must use `src/lib/api.ts` helpers
- Use custom hooks for reusable/cross-cutting logic
- Product discount logic: Handled in `Admin.tsx` with auto-calculation and preview

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
If any section is unclear, incomplete, or missing, please provide feedback or review referenced files for clarification. These instructions are living documentation—improvements are welcome.
# Copilot Instructions for AI Agents — Flower School Admin Frontend

## Architecture Overview
- **Vite + React + TypeScript** SPA for e-commerce and course management
- **UI**: Built with shadcn-ui primitives (`src/components/ui`), styled using Tailwind CSS
- **Directory Structure**:
  - `src/pages`: Route-level views and page logic (no business logic in components)
  - `src/components`: Shared UI/features; `ui/` for shadcn-ui-based primitives
  - `src/lib`: API helpers, authentication, payment, and utilities
  - `src/hooks`: Custom hooks for cross-cutting logic

## Data Flow & Patterns
- **API calls**: Always use `src/lib/api.ts` helpers and React Query (`src/lib/queryClient.ts`) for server communication. Do not call fetch/axios directly in components.
- **Authentication**: Forms and protected routes in `src/components/auth`; logic in `src/lib/auth.ts` and `src/hooks/user-auth.tsx`.
- **State Management**: Use React Query for server state; use local state only for UI interactions.
- **Product & Category Management**: See `src/pages/Admin.tsx` for dynamic forms, category mapping, image upload, and discount logic. Discount preview is auto-calculated in the product form.

## Developer Workflows
- Install dependencies: `npm i`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Deploy: Lovable platform (see `README.md` for integration, domain setup)
- Containerization: See `Dockerfile` and `nginx.conf` for deployment config

## Project-Specific Conventions
- Use shadcn-ui primitives for all new UI (`src/components/ui`)
- Style exclusively with Tailwind CSS classes (no inline styles)
- Page logic must reside in `src/pages`, not in components
- API calls must use `src/lib/api.ts` helpers
- Use custom hooks for reusable/cross-cutting logic
- Product discount logic: Handled in `Admin.tsx` with auto-calculation and preview

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
If any section is unclear, incomplete, or missing, please provide feedback or review referenced files for clarification. These instructions are living documentation—improvements are welcome.
