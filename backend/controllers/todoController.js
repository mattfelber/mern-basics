// controllers/todoController.js
// ---------------------------------------------------------------------------
// CONTROLLER RESPONSIBILITY
// ---------------------------------------------------------------------------
// A controller is the layer that handles one HTTP request.
//
// It receives:
//   req -> information sent by the client
//   res -> tools for building the HTTP response
//
// It then:
//   1. reads the request;
//   2. calls the model/database;
//   3. chooses an HTTP status;
//   4. sends JSON back to the client.
//
// This first learning step extracts only CREATE. The GET, PATCH, and DELETE
// handlers remain in routes/todos.js so the separation can be learned one
// operation at a time without changing the API's behavior.

// require(...) is Node.js's CommonJS import function.
//
// '../models/Todo' means:
//   ..       -> go up from controllers/ to backend/
//   /models  -> enter the models folder
//   /Todo    -> load Todo.js; ".js" is optional in a require path
//
// Todo.js assigns the Mongoose model to module.exports, so the Todo constant
// below receives that model. The model supplies constructors and database
// methods such as new Todo(...), Todo.find(...), and Todo.findById(...).
const Todo = require('../models/Todo');

// createTodo is an asynchronous JavaScript function stored in a constant.
//
// const:
//   The variable cannot be reassigned to a different function later.
//
// async:
//   The function always returns a Promise and may use the await keyword.
//
// (req, res):
//   Express supplies these arguments when a matching request arrives.
//
// =>:
//   This is JavaScript arrow-function syntax.
const createTodo = async (req, res) => {
  // Database and validation work can fail, so await operations belong inside
  // try/catch. If the Promise returned by save() rejects, execution jumps to
  // catch and "err" receives the thrown Error object.
  try {
    // express.json() parsed the incoming JSON before this controller ran.
    //
    // If the client sent:
    //   { "text": "Study controllers" }
    //
    // then:
    //   req.body      is { text: 'Study controllers' }
    //   req.body.text is 'Study controllers'
    //
    // new Todo(...) creates a Mongoose document in memory. "new" invokes the
    // model as a constructor. No MongoDB insert has happened at this line.
    const newTodo = new Todo({
      text: req.body.text
    });

    // save() is an instance method supplied by Mongoose documents.
    //
    // It:
    //   1. validates newTodo using models/Todo.js;
    //   2. sends an insert operation to MongoDB;
    //   3. resolves with the saved document.
    //
    // await pauses this controller until that Promise settles. It does not
    // block Node.js from processing unrelated requests.
    const savedTodo = await newTodo.save();

    // status(201) selects the HTTP "Created" status.
    //
    // json(savedTodo):
    //   1. converts the Mongoose document into a JSON response;
    //   2. sends it to the client;
    //   3. finishes this request.
    //
    // MongoDB/Mongoose have now added values such as _id, createdAt, and
    // updatedAt, so the frontend receives the complete persisted resource.
    res.status(201).json(savedTodo);
  } catch (err) {
    // Examples that can reach this block:
    //   - text is missing, violating required: true;
    //   - text has an invalid type that cannot be converted;
    //   - MongoDB rejects or cannot complete the write.
    //
    // 400 means "Bad Request". For a production application, we would avoid
    // returning every raw database error, but exposing it here makes the
    // validation flow easier to study.
    res.status(400).json({ error: err.message });
  }
};

// module.exports defines the public API of this file.
//
// The object shorthand below:
//   { createTodo }
//
// means exactly the same thing as:
//   { createTodo: createTodo }
//
// Exporting an object lets this controller add getTodos, updateTodo, and
// deleteTodo later without changing the overall import style.
module.exports = {
  createTodo
};
