// routes/todos.js
// This file contains all the API endpoints for managing todos.
// Routes here are mounted at /api/todos in server.js.

const express = require('express');
const Todo = require('../models/Todo');

// Import only the CREATE controller for this incremental learning stage.
//
// require('../controllers/todoController') returns the object exported by
// todoController.js:
//   { createTodo: [Function] }
//
// The braces use JavaScript object destructuring. They take the createTodo
// property from that exported object and create a local constant with the
// same name.
const { createTodo } = require('../controllers/todoController');

// Create a router object. Think of it as a mini Express app.
const router = express.Router();

// GET /api/todos
// Fetch all todo items from the database.
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE: POST /api/todos
//
// server.js mounted this router at /api/todos:
//   app.use('/api/todos', todoRoutes)
//
// This file adds the relative path "/":
//   router.post('/', createTodo)
//
// Express combines them into:
//   POST /api/todos
//
// createTodo has NO parentheses here. We are passing the function itself to
// Express as a callback. Writing createTodo() would execute it immediately
// while the application starts, when no req or res objects exist.
//
// This route answers only "which function handles this method and path?"
// Reading the request, saving to MongoDB, and sending the response are the
// controller's responsibility.
router.post('/', createTodo);

// PATCH /api/todos/:id
// Toggle the completed status of a single todo.
// :id is a URL parameter that Mongoose uses to find the document.
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/todos/:id
// Remove a todo from the database.
router.delete('/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted', todo: deletedTodo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
