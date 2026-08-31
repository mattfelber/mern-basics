// server.js
// This is the entry point of our backend.
// It starts an Express server, connects to MongoDB, and registers our API routes.

// Load environment variables from .env file into process.env.
require('dotenv').config();

// Import the packages we installed.
const express = require('express');       // Web framework for Node.js
const mongoose = require('mongoose');     // Library to talk to MongoDB
const cors = require('cors');             // Allows our React frontend to call this API

// Import our todo route file.
const todoRoutes = require('./routes/todos');

// Import the Todo model because this learning stage keeps the CREATE
// operation directly in server.js.
//
// require(...) is Node's CommonJS import function. It executes Todo.js and
// gives us whatever that file assigned to module.exports. In this project,
// that exported value is the Mongoose Todo model.
const Todo = require('./models/Todo');

// Create the Express application.
const app = express();

// Middleware: these functions run on every request.
app.use(cors());                          // Enable cross-origin requests from React
app.use(express.json());                  // Parse JSON bodies from requests

// Connect to MongoDB using the connection string in .env.
// If MONGO_URI is missing, the app will crash with a clear error.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Stop the server if the database is unreachable
  });

// ---------------------------------------------------------------------------
// CREATE: POST /api/todos
// ---------------------------------------------------------------------------
// This is one complete CRUD operation written directly in the main file.
//
// CRUD means:
//   Create -> POST
//   Read   -> GET
//   Update -> PATCH or PUT
//   Delete -> DELETE
//
// app.post(...) comes from Express. It tells Express:
// "When an HTTP POST request arrives at /api/todos, run this function."
//
// The second argument is a callback function. We give the function to
// Express now, but Express executes it later when a matching request arrives.
//
// async means the function can use await. Database operations take time and
// return Promises, so we wait for MongoDB without blocking the whole server.
app.post('/api/todos', async (req, res) => {
  // req is the incoming HTTP request.
  // res is the HTTP response that we will send back to the client.
  //
  // The React frontend sends JSON similar to:
  //   { "text": "Prepare for my interview" }
  //
  // express.json(), registered above, parses that JSON and places the
  // resulting JavaScript object in req.body.
  try {
    // new Todo(...) creates a Mongoose document in memory.
    // It does NOT write to MongoDB yet.
    //
    // Todo comes from models/Todo.js. Calling it with "new" creates one
    // document that follows the Todo schema.
    const newTodo = new Todo({
      text: req.body.text
    });

    // .save() is a Mongoose document method.
    // It validates newTodo using the schema and then inserts it into MongoDB.
    //
    // await pauses only this request handler until the Promise settles.
    // Other requests can still be processed by Node.js.
    const savedTodo = await newTodo.save();

    // HTTP 201 means "Created".
    // res.json(...) serializes savedTodo to JSON and finishes the response.
    // The saved object includes MongoDB's _id and Mongoose timestamps.
    res.status(201).json(savedTodo);
  } catch (err) {
    // Validation, malformed input, or a database write can fail.
    // HTTP 400 tells the client that the create request could not be accepted.
    res.status(400).json({ error: err.message });
  }
});

// Register routes.
// The other CRUD operations are still handled by routes/todos.js.
// Keeping CREATE here temporarily lets us understand the complete operation
// before moving the same callback into its own controller.
app.use('/api/todos', todoRoutes);

// Simple health-check route so you can verify the server is alive.
app.get('/', (req, res) => {
  res.send('MERN backend is running');
});

// Start listening for requests.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
