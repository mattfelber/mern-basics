# MERN Basics

A minimal todo app for learning the MERN stack:

- **M**ongoDB — database
- **E**xpress — backend framework
- **R**eact — frontend library
- **N**ode.js — runtime

## Project Structure

```
mern-basics/
├── backend/         # Node + Express + MongoDB
│   ├── server.js
│   ├── models/Todo.js
│   ├── routes/todos.js
│   ├── .env.example
│   └── package.json
└── frontend/        # React + Vite
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   └── index.css
    └── package.json
```

## Prerequisites

- Node.js installed
- MongoDB running locally OR a free MongoDB Atlas cluster

## Setup

### 1. Backend

```bash
# In one terminal
cd backend

# Create .env from the example file
cp .env.example .env

# Edit .env and set your MongoDB URI
# MONGO_URI=mongodb://127.0.0.1:27017/mern-basics

npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### 2. Frontend

```bash
# In another terminal
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## What You Can Learn Here

- How Express routes handle HTTP requests
- How Mongoose models data for MongoDB
- How React state and `useEffect` work
- How to call a backend API from a React frontend
- How CORS lets the frontend talk to the backend

## Next Steps

- Add an "Edit" route
- Add validation and error messages in the UI
- Deploy to Render / Vercel / MongoDB Atlas
