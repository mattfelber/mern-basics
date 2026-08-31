// routes/todos.js
// This file contains all the API endpoints for managing todos.
// Routes here are mounted at /api/todos in server.js.

const express = require('express');
const Todo = require('../models/Todo');

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
