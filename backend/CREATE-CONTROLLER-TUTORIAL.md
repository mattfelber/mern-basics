# CREATE, From One File to Route + Controller + Model

This lesson follows **one operation only**:

```text
CREATE a todo = POST /api/todos
```

The repository keeps the other operations working, but only CREATE has been
extracted into a controller. That mixed structure is intentional: it lets you
see one refactor clearly before repeating it for READ, UPDATE, and DELETE.

The two teaching commits are:

```text
ac55c14  CREATE runs directly inside server.js
f0092ac  The same CREATE behavior is split into route + controller + model
```

Use these commands to study each stage:

```bash
git show ac55c14
git show f0092ac
git diff ac55c14 f0092ac
```

The important word is **same**. Refactoring changes where code lives; it should
not change what the API does.

---

## 1. What CREATE means

CRUD is a naming system for four common data operations:

| CRUD operation | Typical HTTP method | Todo example |
|---|---|---|
| Create | `POST` | Add a new todo |
| Read | `GET` | Get existing todos |
| Update | `PATCH` or `PUT` | Change a todo |
| Delete | `DELETE` | Remove a todo |

For this lesson, React sends:

```http
POST /api/todos
Content-Type: application/json

{
  "text": "Study controllers"
}
```

The backend should return:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_id": "...",
  "text": "Study controllers",
  "completed": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

The request supplies only `text`. The schema supplies the default
`completed: false`, MongoDB supplies `_id`, and Mongoose supplies the
timestamps.

---

## 2. Stage one: CREATE directly in `server.js`

Before introducing a route or controller, the whole operation can live in the
Express entry point:

```js
// Load the exported Mongoose model.
const Todo = require('./models/Todo');

// Register a POST endpoint directly on the Express application.
app.post('/api/todos', async (req, res) => {
  try {
    // Build one Todo document in memory.
    const newTodo = new Todo({
      text: req.body.text
    });

    // Validate it and insert it into MongoDB.
    const savedTodo = await newTodo.save();

    // Return the persisted document with HTTP 201 Created.
    res.status(201).json(savedTodo);
  } catch (err) {
    // Return an error response when validation or persistence fails.
    res.status(400).json({ error: err.message });
  }
});
```

This is valid Express code. A controller is not required for Express to work.

At this stage, `server.js` has several responsibilities:

```text
server.js
├── loads configuration
├── imports packages
├── creates the Express app
├── registers middleware
├── connects to MongoDB
├── defines the CREATE endpoint
├── mounts the remaining routes
└── starts the HTTP server
```

That is manageable for one operation. It becomes difficult when the app has
many resources such as todos, users, projects, comments, and authentication.

---

## 3. JavaScript and Express, line by line

### `const Todo = require('./models/Todo')`

`require` comes from Node.js's CommonJS module system.

The model file ends with:

```js
module.exports = Todo;
```

That assignment says, "when another file requires me, give it this value."

Therefore:

```js
const Todo = require('./models/Todo');
```

means:

1. Find and execute `models/Todo.js`.
2. Read its `module.exports`.
3. Store that exported Mongoose model in the local `Todo` constant.

`const` means the variable binding cannot later be reassigned:

```js
Todo = 'something else'; // Not allowed
```

The object stored in a `const` can still perform operations. `const` protects
the variable binding; it does not freeze the object.

### `app.post(path, callback)`

`app` was created by calling:

```js
const app = express();
```

The `express` package returns a function. Calling that function creates an
Express application object. Express gives that object methods such as:

```text
app.use()
app.get()
app.post()
app.patch()
app.delete()
app.listen()
```

This line:

```js
app.post('/api/todos', createFunction);
```

does not create a todo immediately. It **registers** a callback:

> Later, when a POST request matches `/api/todos`, Express should call this
> function.

### `async (req, res) => {}`

This is an anonymous asynchronous arrow function:

```js
async (req, res) => {
  // function body
}
```

Breakdown:

| Syntax | Meaning |
|---|---|
| `async` | The function returns a Promise and may use `await` |
| `req` | Express's request object |
| `res` | Express's response object |
| `=>` | Arrow-function syntax |
| `{}` | The function body |

Express creates `req` and `res` for each incoming request and passes them into
the callback.

Do not call the callback yourself during registration:

```js
app.post('/api/todos', createTodo);   // Correct: pass the function
app.post('/api/todos', createTodo()); // Wrong: execute it immediately
```

### Where `req.body` comes from

This middleware must run before the endpoint:

```js
app.use(express.json());
```

`express.json()` comes from Express. It returns a middleware function that:

1. reads an incoming JSON request body;
2. parses the JSON text;
3. places the resulting JavaScript value in `req.body`;
4. calls the next middleware or route.

Without it, this would not have the expected value:

```js
req.body.text
```

Given:

```json
{
  "text": "Study controllers"
}
```

Express produces approximately:

```js
req.body = {
  text: 'Study controllers'
};
```

### `new Todo({ text: req.body.text })`

`Todo` is a Mongoose model. Mongoose created it with:

```js
mongoose.model('Todo', todoSchema);
```

Using `new` calls that model as a constructor:

```js
const newTodo = new Todo({
  text: req.body.text
});
```

At this moment:

- a JavaScript/Mongoose document exists in memory;
- schema defaults can be applied;
- nothing has necessarily been inserted into MongoDB yet.

### `await newTodo.save()`

`save` is supplied by Mongoose. It is a method on a Mongoose document.

It approximately performs:

```text
validate document
→ send insert to MongoDB
→ wait for MongoDB
→ resolve with saved document
```

Database work is asynchronous, so `save()` returns a Promise.

`await` says:

> Pause this async function until that Promise succeeds or fails.

It does not stop the entire Node.js process. Node can continue handling other
events while MongoDB performs the operation.

### `res.status(201).json(savedTodo)`

`res` is an Express response object.

`status` and `json` are methods supplied by Express:

```js
res.status(201)
```

selects HTTP status `201 Created` and returns the response object, allowing
method chaining:

```js
res.status(201).json(savedTodo);
```

`json`:

1. serializes the value into JSON;
2. sets the JSON response headers;
3. sends the response;
4. ends the request.

The chained line is conceptually similar to:

```js
res.status(201);
res.json(savedTodo);
```

### `try/catch`

`try/catch` is JavaScript error-handling syntax:

```js
try {
  const savedTodo = await newTodo.save();
} catch (err) {
  res.status(400).json({ error: err.message });
}
```

If the awaited Promise rejects, JavaScript jumps to `catch`.

Possible failures include:

- `text` is missing even though the schema requires it;
- a value cannot be converted to the schema type;
- MongoDB is unavailable;
- MongoDB rejects the write.

`err.message` is the human-readable message from the JavaScript Error object.

---

## 4. Why split the operation?

The one-file version combines different questions:

```text
Which URL is this?             Express routing concern
What did the client send?      HTTP/controller concern
How is a todo represented?     Model concern
How is it saved?               Persistence concern
How does the app start?        Infrastructure concern
```

Splitting the code gives each file a smaller purpose:

```text
server     configures and starts the application
route      maps an HTTP method/path to a callback
controller handles req/res and coordinates the operation
model      defines and persists Todo documents
```

The goal is not "more folders." The goal is being able to answer:

> Which file should change for this responsibility?

---

## 5. Stage two: final directory tree

```text
backend/
├── controllers/
│   └── todoController.js  # CREATE's request/response function
├── models/
│   └── Todo.js            # Todo schema and Mongoose model
├── routes/
│   └── todos.js           # HTTP method/path mapping
├── .env                   # Local secrets; never commit
├── .env.example           # Safe configuration template
├── package.json           # Dependencies and npm scripts
├── README.md              # Backend overview
└── server.js              # App configuration and startup
```

For CREATE, the runtime path is:

```text
React
→ POST /api/todos
→ server.js
→ routes/todos.js
→ controllers/todoController.js
→ models/Todo.js
→ MongoDB
→ controller sends HTTP 201 JSON
→ React
```

---

## 6. What moves out of `server.js`

The following resource-specific code moves:

```js
const Todo = require('./models/Todo');

app.post('/api/todos', async (req, res) => {
  // CREATE implementation
});
```

Why?

- The main server should not need a new model import for every resource.
- It should not grow every time a resource gains an endpoint.
- It should focus on application-wide setup.

What remains:

```js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const todoRoutes = require('./routes/todos');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/api/todos', todoRoutes);

app.listen(PORT);
```

Notice the kinds of responsibilities that remain:

- environment configuration;
- framework setup;
- global middleware;
- database connection;
- mounting feature routers;
- starting the server.

`server.js` knows that a todo router exists. It does not know how that router
creates a todo.

---

## 7. What goes into the controller

The CREATE callback moves into `controllers/todoController.js` and receives a
name:

```js
const Todo = require('../models/Todo');

const createTodo = async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text
    });

    const savedTodo = await newTodo.save();

    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createTodo
};
```

The core operation is intentionally almost identical to the one-file version.
Only its location and name changed.

The controller owns:

```text
read req
→ call model
→ choose status code
→ send res
```

### Why give the callback a name?

This anonymous function:

```js
async (req, res) => {}
```

becomes:

```js
const createTodo = async (req, res) => {};
```

A name lets another file import and pass the function to Express.

It also improves:

- stack traces;
- searchability;
- testing;
- communication: "the failure is in `createTodo`."

### Why export an object?

This:

```js
module.exports = {
  createTodo
};
```

exports an object with a `createTodo` property.

Object shorthand means:

```js
{ createTodo }
```

is equivalent to:

```js
{ createTodo: createTodo }
```

Later, the same object can expose more controllers:

```js
module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
};
```

---

## 8. What goes into the route

`routes/todos.js` imports the named controller:

```js
const { createTodo } = require('../controllers/todoController');
```

The braces are JavaScript object destructuring.

Without destructuring:

```js
const todoController = require('../controllers/todoController');

router.post('/', todoController.createTodo);
```

With destructuring:

```js
const { createTodo } = require('../controllers/todoController');

router.post('/', createTodo);
```

Both are valid.

The route itself becomes:

```js
router.post('/', createTodo);
```

This line should read like a table:

```text
POST + / = use createTodo
```

Because `server.js` mounts the router:

```js
app.use('/api/todos', todoRoutes);
```

Express combines:

```text
server prefix: /api/todos
router path:   /
result:        /api/todos
```

Therefore:

```js
router.post('/', createTodo);
```

handles:

```http
POST /api/todos
```

### Why `createTodo`, not `createTodo()`?

Correct:

```js
router.post('/', createTodo);
```

This gives Express the function so it can call it later with `req` and `res`.

Incorrect:

```js
router.post('/', createTodo());
```

This executes the function while the application starts. There is no incoming
request yet, so Express has not supplied `req` or `res`.

This distinction is commonly asked in JavaScript interviews:

```text
createTodo   = reference to the function
createTodo() = call the function now
```

---

## 9. What stays in the model

`models/Todo.js` contains the data definition:

```js
const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
```

The schema answers:

- Which fields exist?
- What types should they have?
- Which fields are required?
- Which defaults should apply?
- Should whitespace be trimmed?
- Should timestamps be generated?

Then:

```js
const Todo = mongoose.model('Todo', todoSchema);
```

creates the Mongoose model.

Useful distinction:

```text
Schema = definition or blueprint
Model  = constructor and database interface built from that schema
Document = one instance created with new Todo(...)
```

Example:

```js
const newTodo = new Todo({ text: 'Study' });
```

| Name | Meaning |
|---|---|
| `todoSchema` | Rules describing Todo documents |
| `Todo` | Mongoose model/class |
| `newTodo` | One document instance |

---

## 10. Where every important method comes from

| Code | Supplied by | Meaning |
|---|---|---|
| `require(...)` | Node.js/CommonJS | Import another module |
| `module.exports` | Node.js/CommonJS | Choose what a module exposes |
| `express()` | Express package | Create an Express application |
| `express.json()` | Express package | Create JSON-parsing middleware |
| `app.use(...)` | Express application | Register middleware or mount a router |
| `app.post(...)` | Express application | Register a POST route on the app |
| `express.Router()` | Express package | Create a modular router |
| `router.post(...)` | Express router | Register a POST route on the router |
| `req.body` | Express request + JSON middleware | Parsed request-body data |
| `res.status(...)` | Express response | Select an HTTP status |
| `res.json(...)` | Express response | Send a JSON response |
| `mongoose.Schema(...)` | Mongoose package | Define document rules |
| `mongoose.model(...)` | Mongoose package | Build a model from a schema |
| `new Todo(...)` | JavaScript + Mongoose model | Construct one Todo document |
| `newTodo.save()` | Mongoose document | Validate and persist that document |
| `async` / `await` | JavaScript | Work with Promises |
| `try` / `catch` | JavaScript | Handle thrown/rejected errors |
| `{ createTodo }` | JavaScript | Object shorthand or destructuring |

This classification is useful in interviews. Instead of saying "JavaScript
does this," identify whether a behavior comes from JavaScript, Node, Express,
Mongoose, MongoDB, or your own code.

---

## 11. Request lifecycle after the split

### Step 1: React sends JSON

```js
fetch('http://localhost:5000/api/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Study controllers'
  })
});
```

`JSON.stringify` is a built-in JavaScript method. It converts a JavaScript
object into JSON text suitable for an HTTP body.

### Step 2: global middleware parses JSON

```js
app.use(express.json());
```

Now the backend can read:

```js
req.body.text
```

### Step 3: the mounted router receives the request

```js
app.use('/api/todos', todoRoutes);
```

### Step 4: the route selects the controller

```js
router.post('/', createTodo);
```

### Step 5: the controller constructs a document

```js
const newTodo = new Todo({
  text: req.body.text
});
```

### Step 6: Mongoose validates and saves

```js
const savedTodo = await newTodo.save();
```

### Step 7: the controller sends the response

```js
res.status(201).json(savedTodo);
```

### Step 8: React receives the saved resource

The returned todo has its database `_id`, so React can display it and later
address it in PATCH or DELETE requests.

---

## 12. What did not change?

Before and after the refactor:

```text
Method:         POST
URL:            /api/todos
Request body:   { "text": "..." }
Success status: 201
Success body:   saved todo JSON
Error status:   400
```

That is how you recognize a structural refactor: callers of the API do not
need to change.

---

## 13. Why only CREATE is in the controller right now

The final project intentionally has:

```text
CREATE        -> controller
READ          -> inline route handler
UPDATE        -> inline route handler
DELETE        -> inline route handler
```

This is not the final architecture you would normally choose for a production
application. It is a teaching checkpoint.

Once CREATE makes sense, repeat the same mechanical process:

1. Copy one inline handler from the router.
2. Give it a descriptive name.
3. Move it into the controller.
4. Export it.
5. Import it into the router.
6. replace the inline callback with the named function reference;
7. verify that method, URL, status codes, and JSON are unchanged.

The final controller would export:

```js
module.exports = {
  createTodo,
  getTodos,
  toggleTodo,
  deleteTodo
};
```

The final router would become:

```js
router.get('/', getTodos);
router.post('/', createTodo);
router.patch('/:id', toggleTodo);
router.delete('/:id', deleteTodo);
```

At that point, the route file is almost entirely a readable endpoint map.

---

## 14. Interview-ready explanation

> I first wrote POST `/api/todos` directly in the Express entry point so I
> could see the complete request lifecycle in one place. The handler read
> `req.body`, constructed a Mongoose document, awaited `save()`, and returned
> HTTP 201. I then refactored without changing API behavior: `server.js`
> retained application-wide setup, the router mapped the POST endpoint to a
> named callback, the controller handled the HTTP request and response, and
> the model continued to define and persist Todo documents. This separation
> makes the code easier to navigate, test, and extend.

Follow-up questions to practice:

1. Why is CREATE normally a POST request?
2. Why is the success status `201` instead of `200`?
3. Where does `req.body` come from?
4. What is the difference between a schema, model, and document?
5. Why does `save()` need `await`?
6. Why pass `createTodo` instead of calling `createTodo()`?
7. What does `module.exports` do?
8. What responsibility belongs to a route?
9. What responsibility belongs to a controller?
10. Does splitting the code change the HTTP API?

If you can answer those without reading the source, the pieces are connecting.

---

## 15. Practice exercise

After understanding CREATE, extract READ yourself:

```js
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

Your target is:

```js
router.get('/', getTodos);
```

Before coding, answer:

- What should the controller function be named?
- Which import must move from the route?
- Which value must be exported?
- Which status codes and response body must stay unchanged?
- Does `server.js` need to change?

For this extraction, the answer to the last question is **no**. Once a router
is mounted, adding or reorganizing controllers behind it should not require
the main server to know those details.
