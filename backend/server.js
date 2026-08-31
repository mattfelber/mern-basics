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

// Register routes.
//
// server.js only mounts the todo router. It does not need to know which
// controller handles POST, GET, PATCH, or DELETE. That resource-specific
// mapping belongs to routes/todos.js.
//
// Requests beginning with /api/todos enter todoRoutes. The router then checks
// the remaining path and HTTP method to choose the correct callback.
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
