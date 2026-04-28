const express = require("express")
const user = express.Router()


// GET ALL
user.get('/todos', (req, res) => {
    res.status(200).json(todos); // send array as JSON
});

// GET ACTIVE TODOS (not completed)
user.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter(t => t.status === "pending");
    if (activeTodos.length === 0) {
        return res.status(200).json({ message: "All todos are completed!" });
    }
    res.status(200).json(activeTodos);
});

// GET COMPLETED TODOS
user.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter(t => t.status === "completed");
    if (completedTodos.length === 0) {
        return res.status(200).json({ message: "No completed todos yet" });
}
    res.status(200).json(completedTodos);
});

// GET by ID
user.get('/todos/:id', (req, res) => {
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
user.post('/todos', (req, res) => {
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
user.patch('/todos/:id', (req, res) => {
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
user.delete('/todos/:id', (req, res) => {
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




module.exports = user