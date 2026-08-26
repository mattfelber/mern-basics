# Frontend — React + Vite

This folder is the **client**: the code that runs in the user's browser.
It shows the UI and calls the backend API with `fetch()` to load and change data.
It never talks to MongoDB directly — only the backend does that.

## Read the files in this order

1. **`index.html`** — the single HTML page the browser loads. It's almost
   empty: just a `<div id="root">` and a script tag pointing at `main.jsx`.
2. **`src/main.jsx`** — the JavaScript entry point. It renders the `<App />`
   component into that `root` div. You rarely touch this file.
3. **`src/App.jsx`** — the actual app. All the state, the API calls, and the
   UI live here. Spend most of your time in this file.
4. **`vite.config.js`** — tells Vite to handle React (JSX) files. Tiny on purpose.

## What is Vite? (and why tutorials look different)

React code (JSX) can't run in a browser as-is — something must transform and
serve it. That "something" is a **build tool**:

- Older tutorials (like freeCodeCamp's) use **Create React App (CRA)** —
  now deprecated.
- This project uses **Vite**, the modern replacement. Same React, different
  tooling.

Practical differences you'll notice when following a CRA tutorial:

| Thing                | CRA tutorial says          | In this Vite project        |
|----------------------|----------------------------|-----------------------------|
| Dev server port      | `localhost:3000`           | `localhost:5173`            |
| Entry file           | `src/index.js`             | `src/main.jsx`              |
| `index.html` lives   | in `public/`               | at the project root         |
| Env variables        | `process.env.REACT_APP_X`  | `import.meta.env.VITE_X`    |
| Start command        | `npm start`                | `npm run dev`               |

The React code itself (components, hooks, JSX) is identical in both.

## The two ideas that make React "click"

1. **State is the source of truth.** The UI is a function of state. You never
   edit the page directly — you call `setTodos(...)` and React re-renders the
   list to match.
2. **Effects run after render.** `useEffect(() => { ... }, [])` with an empty
   array runs once when the component first appears — that's why the todo list
   loads on page load.

Every handler in `App.jsx` follows the same recipe:

```
1. fetch() → tell the backend what changed
2. setTodos(...) → update local state so the UI matches
```

## Running it

```bash
npm install
npm run dev    # then open http://localhost:5173
```

Remember: the backend must also be running (in another terminal) or every
`fetch()` will fail.
