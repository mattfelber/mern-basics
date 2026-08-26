# MERN Stack Tutorial — Minimal Todo App

This tutorial walks through the project in this folder line by line. It assumes you know a little JavaScript but are new to the MERN stack.

---

## 1. What is MERN?

MERN is a set of technologies used together to build full-stack web apps:

| Letter | Technology | Role |
|--------|------------|------|
| **M**  | MongoDB    | Database that stores your data as documents |
| **E**  | Express    | Backend framework that handles HTTP requests |
| **R**  | React      | Frontend library that builds the user interface |
| **N**  | Node.js    | Runtime that runs your backend code |

The big picture:

```
Browser (React)  <--HTTP-->  Express server (Node)  <--Mongoose-->  MongoDB
```

---

## 2. Project Structure

```
mern-basics/
├── backend/
│   ├── server.js          # Entry point: starts the server
│   ├── models/Todo.js     # Defines the shape of a todo in MongoDB
│   ├── routes/todos.js    # Defines API endpoints for todos
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Example environment variables
└── frontend/
    ├── index.html         # HTML page the browser loads
    ├── vite.config.js     # Vite configuration
    ├── src/
    │   ├── main.jsx       # Renders React into the page
    │   ├── App.jsx        # Main component with todo logic
    │   └── index.css      # Basic styles
    └── package.json       # Frontend dependencies
```

---

## 3. The Backend (Node + Express + MongoDB)

### `backend/server.js`

This file starts everything on the backend side.

What it does:

1. **Loads environment variables** from `.env`:

   ```js
   require('dotenv').config();
   ```

   This lets you write `process.env.MONGO_URI` instead of putting secrets directly in your code.

2. **Imports packages**:

   - `express` — the web framework
   - `mongoose` — the tool that talks to MongoDB
   - `cors` — allows the frontend on a different port to call this API

3. **Adds middleware**:

   ```js
   app.use(cors());
   app.use(express.json());
   ```

   - `cors()` allows requests from `http://localhost:5173` (the React dev server) to reach `http://localhost:5000` (the backend).
   - `express.json()` automatically converts incoming JSON request bodies into JavaScript objects.

4. **Connects to MongoDB**:

   ```js
   mongoose.connect(process.env.MONGO_URI);
   ```

   If the connection fails, the server exits because it cannot work without the database.

5. **Mounts routes**:

   ```js
   app.use('/api/todos', todoRoutes);
   ```

   This means any request starting with `/api/todos` is handled by `routes/todos.js`.

6. **Starts listening**:

   ```js
   app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
   ```

---

### `backend/models/Todo.js`

MongoDB stores data as **documents** in **collections**. A collection is like a table, and a document is like a row.

Mongoose lets us define a **schema** so MongoDB knows what shape our documents should have:

```js
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });
```

This schema says every todo must have:

- `text`: a string (required)
- `completed`: a boolean that defaults to `false`
- `createdAt` and `updatedAt`: automatically added because of `timestamps: true`

Then we create a model:

```js
const Todo = mongoose.model('Todo', todoSchema);
```

Mongoose automatically names the collection `todos` (lowercase and plural).

---

### `backend/routes/todos.js`

This file defines the API endpoints for the todo resource.

An **endpoint** is a URL + HTTP method combination that does one thing.

#### GET `/api/todos`

```js
router.get('/', async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});
```

- `Todo.find()` asks MongoDB for every todo document.
- `.sort({ createdAt: -1 })` puts the newest first.
- `res.json(todos)` sends the array back to the frontend as JSON.

#### POST `/api/todos`

```js
router.post('/', async (req, res) => {
  const newTodo = new Todo({ text: req.body.text });
  const savedTodo = await newTodo.save();
  res.status(201).json(savedTodo);
});
```

- `req.body.text` comes from the frontend form input.
- `new Todo(...)` creates a new document.
- `.save()` writes it to MongoDB.
- `201` is the HTTP status for "created successfully."

#### PATCH `/api/todos/:id`

```js
router.patch('/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  todo.completed = !todo.completed;
  const updatedTodo = await todo.save();
  res.json(updatedTodo);
});
```

- `:id` is a URL parameter. If the request is `PATCH /api/todos/abc123`, then `req.params.id` is `abc123`.
- We flip `completed` from `true` to `false` or vice versa.

#### DELETE `/api/todos/:id`

```js
router.delete('/:id', async (req, res) => {
  const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Todo deleted', todo: deletedTodo });
});
```

This removes the matching document from MongoDB.

---

## 4. The Frontend (React + Vite)

### `frontend/index.html`

This is the only HTML file. It contains:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

React will render the entire app inside the `root` div.

### `frontend/src/main.jsx`

This is the JavaScript entry point:

```js
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

It finds the `root` element and renders the `App` component inside it.

### `frontend/src/App.jsx`

This is where the real app lives. Read it from top to bottom:

#### State

```js
const [todos, setTodos] = useState([]);
const [text, setText] = useState('');
```

- `todos` stores the list of todos from the database.
- `text` stores whatever the user typed into the input box.

#### Loading todos on startup

```js
useEffect(() => {
  fetchTodos();
}, []);
```

`useEffect` runs after the component appears on screen. The empty array `[]` means "run only once." It calls `fetchTodos`, which does:

```js
const response = await fetch(API_URL);
const data = await response.json();
setTodos(data);
```

This sends a `GET` request to the backend, then updates React state with the result.

#### Adding a todo

```js
const addTodo = async (e) => {
  e.preventDefault();
  if (!text.trim()) return;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  const newTodo = await response.json();
  setTodos([newTodo, ...todos]);
  setText('');
};
```

- `e.preventDefault()` stops the browser from reloading the page when the form is submitted.
- `JSON.stringify({ text })` turns the JavaScript object into a JSON string for the backend.
- After the backend responds with the saved todo, we add it to the top of the list.

#### Toggling and deleting

Both work the same way: send a request to the backend, then update the local list so the UI refreshes.

### `frontend/src/index.css`

Plain CSS. No framework. It just makes the app readable.

---

## 5. How the Pieces Talk to Each Other

Here is the full flow when you add a todo:

1. You type in the input and click **Add**.
2. React calls `addTodo`, which sends a `POST` request to `http://localhost:5000/api/todos`.
3. CORS allows the request because the frontend is on port `5173` and the backend is on port `5000`.
4. Express receives the request, `express.json()` parses the body into `req.body`.
5. The route in `routes/todos.js` creates a new Mongoose document and saves it to MongoDB.
6. MongoDB returns the new document with an `_id`.
7. Express sends it back as JSON.
8. React receives it, updates `todos`, and re-renders the list.

---

## 6. Common Beginner Mistakes

### Forgetting to start both servers

The frontend and backend are separate. You need **two terminals** running:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### CORS errors in the browser console

If you see `CORS policy has blocked`, it usually means the backend is not running, or `cors()` was not added.

### MongoDB not running

If you see `MongoDB connection error`, check that:

- MongoDB is installed and running locally, or
- Your MongoDB Atlas URI is correct (including username, password, and database name).

### The input clears but nothing is added

Open the browser's developer tools, go to the **Network** tab, and look at the `todos` POST request. The response will tell you if the backend rejected the request.

### Confusing `_id` with `id`

MongoDB automatically creates `_id` (with an underscore). Our React code uses `todo._id` as the React `key` prop.

---

## 7. Next Steps to Practice

After you understand this app, try adding these features in order:

1. **Edit button**: add a `PUT /api/todos/:id` route and an edit form in React.
2. **Loading state**: show "Loading..." while todos are being fetched.
3. **Error messages**: show a message when a request fails.
4. **Filter buttons**: show only completed or active todos.
5. **Deploy**: put the backend on Render and the frontend on Vercel.

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| API | A set of URLs the frontend can call to interact with the backend |
| Endpoint | One specific URL + HTTP method, like `GET /api/todos` |
| HTTP method | The action of a request: `GET`, `POST`, `PATCH`, `DELETE` |
| JSON | A text format for sending data between frontend and backend |
| Middleware | Code that runs on every request, like `express.json()` |
| Schema | A blueprint describing the fields of a MongoDB document |
| Model | A Mongoose object used to create, read, update, and delete documents |
| Component | A reusable piece of UI in React |
| State | Data inside a component that React watches and re-renders when it changes |
| Hook | A special React function; `useState` and `useEffect` are the most common |
