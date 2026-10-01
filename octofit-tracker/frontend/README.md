# OctoFit Tracker frontend

The React interface runs on port 5173 and reads collection data from the API on port 8000.

## Codespaces configuration

Set `VITE_CODESPACE_NAME` to the Codespace name in `octofit-tracker/frontend/.env.local`:

```env
VITE_CODESPACE_NAME=your-codespace-name
```

Restart Vite after changing the environment file. When the variable is unset, local requests use `/api` and the Vite development proxy forwards them to `http://127.0.0.1:8000`.

## Development and checks

Run commands from the workspace root:

```bash
npm install --prefix octofit-tracker/frontend
npm run --prefix octofit-tracker/frontend dev
npm run --prefix octofit-tracker/frontend test
npm run --prefix octofit-tracker/frontend lint
npm run --prefix octofit-tracker/frontend build
```
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
