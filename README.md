# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Added project notes

This workspace has been extended with a simple app scaffold including:

- Tailwind CSS (dark mode via `class` strategy)
- React Router v6 routes and protected route wrapper
- Demo `AuthContext` (client-side stub; replace with API calls)
- Role-based dashboards (`/admin`, `/pm`, `/team`)
- Kanban board using `react-beautiful-dnd`
- Forms with `react-hook-form` and `yup` validation

Run locally:

```bash
cd Frontend/frontend
npm install
npm run dev
```

Replace `AuthContext` methods with real backend requests and secure token handling for production.
