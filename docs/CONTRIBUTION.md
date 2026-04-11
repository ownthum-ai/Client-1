# Contributing to Ownthum

## Getting Started

### Prerequisites
- Node.js 20+ (Node 22 recommended)
- npm 10+

### Setup

```bash
git clone <repo-url>
cd ownthum-app
npm install
npm run dev
```

---

## Tech Stack Quick Reference

| Concern | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 (localStorage persist) |
| Linting | ESLint 9 + eslint-config-next 15 |

---

## Migration Notes: React 19 + Next.js 15

### React 19 Breaking Changes

**Removed APIs — do not use:**
- `ReactDOM.render()` → use `createRoot()` (Next.js handles this automatically)
- `ReactDOM.hydrate()` → use `hydrateRoot()`
- Legacy Context API (`childContextTypes`, `getChildContext`) → use `React.createContext`
- `defaultProps` on function components → use default parameter values
- `propTypes` → use TypeScript types

**Changed APIs:**
- `useFormState` (react-dom) → renamed to `useActionState` (react)
- `ref` is now a regular prop in function components — `forwardRef` wrapper is no longer needed for new components
- `React.FC` no longer includes implicit `children` prop — declare it explicitly

**New in React 19:**
- Native `<form>` actions and `useActionState`
- Optimistic updates via `useOptimistic`
- `use()` hook for consuming promises and context
- Asset preloading APIs (`preload`, `preinit`, etc.)

**TypeScript types (`@types/react` 19):**
- `React.ReactElement` props type changed — if you pass `null` as children, use `React.ReactNode`
- `ref` callback cleanup: return a cleanup function from ref callbacks if needed

---

### Next.js 15 Breaking Changes

**Async Request APIs** — `cookies()`, `headers()`, and `params`/`searchParams` props are now **async**:

```tsx
// Before (Next.js 14)
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}

// After (Next.js 15)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

**Caching** — `fetch` requests and Route Handlers are **no longer cached by default**. Add `{ cache: 'force-cache' }` explicitly where caching is needed.

**`next dev --turbo`** is now the default. If you encounter issues, run `next dev --no-turbo` to fall back.

**`<Link>` no longer renders `<a>` by default for passHref scenarios** — use `legacyBehavior` if needed.

---

### ESLint 9 — Flat Config

ESLint 9 uses a flat config file (`eslint.config.mjs`) instead of `.eslintrc.json`.

The project now includes `eslint.config.mjs`. **Delete `.eslintrc.json`** if it still exists after upgrading.

```js
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

---

## Code Style Guide

### Component Files
- All interactive components must have `"use client"` at the top
- Server components should avoid the directive — let Next.js default to server rendering
- Use named exports for utility components, default exports for pages

### TypeScript
- Prefer explicit return types on exported functions
- Use `interface` for object shapes in the store, `type` for unions and aliases
- Avoid `any` — use `unknown` with type guards

### Tailwind Classes
- Use CSS custom properties (`var(--gold)`, `var(--text)`) for theme tokens — never hardcode colour hex values
- Merge conditional classes with `clsx` + `tailwind-merge` (`cn()` pattern)
- The `v2={true}` prop on `Button`/`Input` opts into the v2 visual style — use it for all new forms/pages

### State (Zustand)
- All state lives in `src/store/useStore.ts` — do not create additional stores
- Use selector subscriptions (`useStore(state => state.field)`) to avoid unnecessary re-renders
- Computed values should be `useMemo` on the consuming component, not stored in the store

### Animations (Framer Motion)
- Define `variants` outside the component to prevent re-creation on each render
- Use `staggerChildren` on container variants for list entries
- Prefer `layout` prop over manual position tracking for reordering animations

---

## Pull Request Process

1. Branch from `main` — use `feature/`, `fix/`, or `chore/` prefixes
2. Keep PRs focused — one module or concern per PR
3. Run `npm run lint` before opening a PR — no lint errors allowed
4. Run `npm run build` to verify no type errors
5. Include a short description of what changed and why

---

## Future Upgrade Considerations

| Package | Current | Notes |
|---|---|---|
| Tailwind CSS | 3.x | v4 is a full rewrite (CSS-based config, no `tailwind.config.ts`). Defer until stable and lightswind supports it. |
| `@react-three/fiber` | 9.x | Already supports React 19. Keep in sync with `three` version. |
| `framer-motion` | 12.x | React 19 compatible. Monitor for Motion API changes. |
| `recharts` | 3.x | Verify React 19 compatibility with recharts; use `ResponsiveContainer` pattern. |
| `lightswind` | 3.x | Internal UI kit. Monitor for peer dependency issues with React 19. |
