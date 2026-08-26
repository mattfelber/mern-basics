# MERN Interview Prep

Short answers to the questions interviewers actually ask about an app like
this one. Practice saying these out loud — each answer is meant to take
15–30 seconds.

---

## The stack itself

**"Walk me through the architecture of your app."**
> It's a classic three-tier MERN app. React runs in the browser and calls a
> REST API with `fetch`. The API is Express running on Node — it validates
> input and uses Mongoose to read and write MongoDB. The frontend never
> touches the database directly.

**"Why Vite instead of Create React App?"**
> CRA is deprecated. Vite is the modern replacement — it starts near-instantly
> because it serves files as native ES modules instead of bundling the whole
> app first, and hot reload is much faster. The React code is the same;
> only the tooling changes.

**"What is Node.js? Isn't JavaScript a browser language?"**
> Node is a runtime that runs JavaScript outside the browser, on a server.
> It lets us use one language for both frontend and backend.

**"SQL vs MongoDB — why Mongo here?"**
> MongoDB stores JSON-like documents, which maps naturally to JavaScript
> objects — no ORM impedance, quick to iterate. For heavily relational data
> with strict constraints, SQL would be a better fit. Know the trade-off,
> not just the choice.

---

## CRUD & REST

**"Map CRUD to HTTP methods."**

| CRUD   | HTTP     | In this app                 |
|--------|----------|-----------------------------|
| Create | POST     | `POST /api/todos`           |
| Read   | GET      | `GET /api/todos`            |
| Update | PUT/PATCH| `PATCH /api/todos/:id`      |
| Delete | DELETE   | `DELETE /api/todos/:id`     |

**"PUT vs PATCH?"**
> PUT replaces the whole resource; PATCH changes part of it. We use PATCH
> because we only flip the `completed` field.

**"Which status codes do you return and why?"**
> 200 OK for successful reads/updates, 201 Created after a POST,
> 400 for bad input (validation errors), 404 when the `:id` doesn't exist,
> 500 for unexpected server errors.

**"What does `express.json()` do? What happens without it?"**
> It's middleware that parses JSON request bodies into `req.body`.
> Without it, `req.body` is `undefined` and every POST breaks.

**"What is CORS and why did you need it?"**
> Browsers block requests to a different origin by default. In dev the
> frontend is on port 5173 and the API on 5000 — different origins — so the
> backend uses the `cors` middleware to send headers that allow it.

**"What is `req.params` vs `req.body` vs `req.query`?"**
> `req.params` = URL segments like `:id`. `req.body` = the JSON payload.
> `req.query` = the `?key=value` part of the URL.

---

## MongoDB / Mongoose

**"What's a schema and a model?"**
> The schema describes the shape of a document — fields, types, defaults,
> required-ness. The model is the class Mongoose builds from the schema;
> it's what I call `find`, `findById`, `save`, `findByIdAndDelete` on.

**"What is `_id`?"**
> MongoDB gives every document a unique `_id` (an ObjectId) automatically.
> The frontend uses it as the React `key` and in URLs like `/api/todos/:id`.

**"Why is every database call `await`ed?"**
> Database calls are asynchronous — they return promises. `await` pauses the
> handler until the result arrives, and `try/catch` around it handles
> failures so the server doesn't crash on a bad request.

---

## React

**"How does data get on the screen when the page loads?"**
> `useEffect` with an empty dependency array runs once after the first
> render. It fetches `/api/todos` and stores the result with `setTodos`,
> which triggers a re-render showing the list.

**"Why can't you just modify the todos array directly?"**
> React only re-renders when state is replaced via the setter. That's why
> the code builds new arrays: `[newTodo, ...todos]` to add,
> `todos.filter(...)` to remove, `todos.map(...)` to replace one item.

**"What is the `key` prop and why `todo._id`?"**
> Keys let React match list items between renders so it updates only what
> changed. It must be stable and unique — the database `_id` is perfect.

**"After you POST a new todo, how does the UI update?"**
> The backend responds with the saved todo (including its new `_id`), and we
> prepend it to state: `setTodos([newTodo, ...todos])`. Alternative: refetch
> the whole list — simpler but an extra request.

**"What does `e.preventDefault()` do in the form handler?"**
> Stops the browser's default form submission, which would reload the page
> and wipe our state.

---

## Debugging (they love this one)

**"The list is empty and nothing happens when you add a todo. How do you debug?"**
> 1. Browser DevTools → Network tab: is the request being sent? What status?
> 2. Failed to fetch / CORS error → backend probably isn't running.
> 3. 400/500 → read the JSON error body; check the backend terminal logs.
> 4. Backend up but errors on startup → check MongoDB is running and
>    `MONGO_URI` in `.env` is correct.

---

## Say-this-not-that

- Say "the frontend **calls the API**", not "the frontend connects to MongoDB".
- Say "**state drives the UI**", not "I update the page".
- Say "middleware **runs on every request**", not "some Express setup thing".
- If you don't know, say how you'd find out (docs, Network tab, console.log).
