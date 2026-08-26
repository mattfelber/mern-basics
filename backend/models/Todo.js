// models/Todo.js
// A Mongoose model defines the shape (schema) of documents stored in a MongoDB collection.

const mongoose = require('mongoose');

// Define the schema for a todo item.
const todoSchema = new mongoose.Schema({
  // 'text' is required and must be a string.
  text: {
    type: String,
    required: true,
    trim: true
  },
  // 'completed' defaults to false.
  completed: {
    type: Boolean,
    default: false
  },
  // Mongoose can add a createdAt timestamp automatically.
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

// Create the model from the schema.
// MongoDB will create/use a collection named 'todos' (lowercased and pluralized).
const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
