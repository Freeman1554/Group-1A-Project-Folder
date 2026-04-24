// Load environment variables from .env file
require('dotenv').config(); 

// Import necessary modules
const express = require( 'express') ;
const app = express();

//body parsing middleware
app.use(express.json()); // Parse JSON bodies

// Root route - simple welcome message
app.get('/', (req, res) => {
    res.send("Task Manager API is running...");
});

// In-memory data store for todos
let todos = [
    { id: 1, task: "Learn Node.js", status: "pending", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, task: "Build CRUD API", status: "pending", createdAt: new Date(), updatedAt: new Date() }
];

let currentId = todos.length
    ? Math.max(...todos.map(t => t.id))
    : 0;

// GET ALL
app.get('/todos', (req, res) => {
    res.status(200).json(todos); // send array as JSON
});

// GET ACTIVE TODOS (not completed)
app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter(t => t.status === "pending");
    if (activeTodos.length === 0) {
        return res.status(200).json({ message: "All todos are completed!" });
    }
    res.status(200).json(activeTodos);
});

// GET COMPLETED TODOS
app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter(t => t.status === "completed");
    if (completedTodos.length === 0) {
        return res.status(200).json({ message: "No completed todos yet" });
}
    res.status(200).json(completedTodos);
});

// GET by ID
app.get('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    // NEW: check if invalid
    if (isNaN(id)) { // Check if ID is a valid number
        return res.status(400).json({ error: "Invalid ID" });
    }
    const todo = todos.find((t) => t.id === id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.status(200).json(todo);
});

// POST - Create a new todo item
app.post('/todos', (req, res) => {
    const { task } = req.body;
    // Validation
    if (!task || task.trim() === "") {
        return res.status(400).json({ error: "Task field is required" });
    }
    const cleanTask = task.trim(); // Trim whitespace from task
    const newTodo = {
        id: ++currentId, // Increment ID for new todo
        task: cleanTask, // Store trimmed task
        status: "pending", // Default status
        createdAt: new Date(), // Set creation timestamp
        updatedAt: new Date()  // Set update timestamp
    };
    // Add new todo to the array
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PATCH Update - Partial update of a todo item
app.patch('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    // Validate ID
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    // Find todo
    const todo = todos.find(t => t.id === id);
    if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
    }
    // Extract fields from request body
    const { task, status } = req.body;
    // Helper validation (optional but clean)
    const isValidString = (value) =>
        typeof value === "string" && value.trim().length > 0;
    // Update task (if provided)
    if (task !== undefined) {
        if (!isValidString(task)) {
            return res.status(400).json({ error: "Task must be a non-empty string" });
        }
        todo.task = task.trim();
    }
    // Update status (if provided)
    if (status !== undefined) {
        if (!["pending", "completed"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'pending' or 'completed'" });
        }
        todo.status = status;
    }
    // Update timestamp
    todo.updatedAt = new Date();
    // Return updated todo
    res.status(200).json(todo);
});

// DELETE - Remove a todo item by ID
app.delete('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    // Validate ID
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    // Find index of todo
    const todoIndex = todos.findIndex(t => t.id === id);
    // Check if todo exists
    if (todoIndex === -1) {
        return res.status(404).json({ error: "Todo not found" });
    }
    // Remove todo safely
    const deletedTodo = todos.splice(todoIndex, 1);
    // Return response
    res.status(200).json({
        message: "Todo deleted successfully",
        deleted: deletedTodo[0],
        remainingTodos: todos.length
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 3000; // Default to 3000 if not set in .env
app.listen(PORT, () => {
    console.log(`APP is running on port ${PORT}`);
});