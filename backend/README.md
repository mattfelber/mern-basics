# Backend — Node + Express + MongoDB

This folder is the **server**: it receives HTTP requests from the React app,
talks to MongoDB, and sends JSON back. It never renders any HTML.

## Read the files in this order

1. **`server.js`** — the entry point. Everything starts here: it creates the
   Express app, connects to MongoDB, and plugs in the routes.
2. **`models/Todo.js`** — describes what a "todo" looks like in the database
   (its fields and their types). One file per data type is the convention.
3. **`routes/todos.js`** — the API endpoints (the URLs the frontend calls).
   Each endpoint uses the `Todo` model to read/write the database.

## What each folder means

```
backend/
├── server.js       # Starts the app. Think "main()".
├── models/         # One file per database "shape" (schema). Like table definitions in SQL.
├── routes/         # One file per resource. Groups all URLs for that resource together.
├── .env            # Your secrets (DB password etc). NOT committed to git.
└── .env.example    # A template showing which variables .env needs.
```

Why split models and routes into folders? For a tiny app you could put
everything in `server.js`. Real projects split them so each file has one job:
**models describe data, routes describe URLs**. Interviewers like hearing this.

## The life of one request

When the React app calls `POST /api/todos` with `{ "text": "buy milk" }`:

```
Browser fetch()                          (frontend/src/App.jsx)
   │
   ▼
Express receives the request             (server.js)
   │  app.use(cors())          → allows the cross-origin request
   │  app.use(express.json())  → turns the JSON body into req.body
   │  app.use('/api/todos', …) → forwards it to routes/todos.js
   ▼
router.post('/', …)                      (routes/todos.js)
   │  reads req.body.text
   │  new Todo({ text }) + .save()       (models/Todo.js defines what's valid)
   ▼
MongoDB stores the document and gives it an _id
   │
   ▼
res.status(201).json(savedTodo)  → JSON goes back to the browser
```

## Words that trip up beginners

- **Middleware** = a function that runs on *every* request before your routes.
  `cors()` and `express.json()` are middleware. `app.use(...)` registers them.
- **Route / endpoint** = one URL + HTTP method pair, e.g. `GET /api/todos`.
- **Model** = a JavaScript class (made by Mongoose) that you use to talk to one
  MongoDB collection. `Todo.find()`, `Todo.findById()`, `new Todo().save()`.
- **`req` and `res`** = the incoming *request* and the *response* you send back.
  - `req.body` — data sent by the client (needs `express.json()`)
  - `req.params.id` — the `:id` part of the URL
  - `res.json(...)` — send JSON back and end the request

## Running it

```bash
cp .env.example .env   # then edit MONGO_URI if needed
npm install
npm run dev            # nodemon restarts the server when you save a file
```
