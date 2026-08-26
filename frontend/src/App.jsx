import { useState, useEffect } from 'react';

// Base URL for our Express API.
// In development the React dev server runs on port 5173,
// so we must talk to the backend on port 5000 directly.
const API_URL = 'http://localhost:5000/api/todos';

function App() {
  // State to hold the list of todos and the input field value.
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  // Fetch todos from the backend when the component first loads.
  useEffect(() => {
    fetchTodos();
  }, []);

  // GET request: load all todos from MongoDB through our API.
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
    }
  };

  // POST request: send a new todo to the backend.
  const addTodo = async (e) => {
    e.preventDefault(); // Stop the browser from refreshing the page
    if (!text.trim()) return; // Don't send empty todos

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('Failed to add todo');
      const newTodo = await response.json();
      // Add the new todo to the top of the list.
      setTodos([newTodo, ...todos]);
      setText(''); // Clear the input
    } catch (err) {
      console.error(err);
    }
  };

  // PATCH request: toggle the completed status of a todo.
  const toggleTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      // Replace the old todo with the updated one in state.
      setTodos(todos.map((todo) => (todo._id === id ? updated : todo)));
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE request: remove a todo from the backend.
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      // Remove the deleted todo from state without refetching everything.
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>MERN Todo App</h1>

      {/* Form to add a new todo */}
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          placeholder="Enter a todo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {/* List of todos */}
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo._id)}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
