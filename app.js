// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data store for todos
let todos = [
    { id: 1, task: 'Learn Node.js', description: 'Understand basics of Node', status: 'pending' },
    { id: 2, task: 'Build CRUD API', description: 'Practice Express routing', status: 'pending' }
];

let currentId = todos.length ? Math.max(...todos.map(t => t.id)) : 0;

const isValidString = (value) => typeof value === 'string' && value.trim().length > 0;
const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const findTodoById = (id) => todos.find((todo) => todo.id === id);

// Root route - simple welcome message
app.get('/', (req, res) => {
    res.send('Task Manager API is running...');
});

// GET ALL todos
app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

// GET active todos (pending)
app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter((todo) => todo.status === 'pending');
    if (activeTodos.length === 0) {
        return res.status(200).json({ message: 'All todos are completed!' });
    }
    res.status(200).json(activeTodos);
});

// GET completed todos
app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter((todo) => todo.status === 'completed');
    if (completedTodos.length === 0) {
        return res.status(200).json({ message: 'No completed todos yet' });
    }
    res.status(200).json(completedTodos);
});

// GET todos by search query
app.get('/todos/search', (req, res) => {
    const query = normalizeString(req.query.q);
    if (!query) {
        return res.status(400).json({ error: 'Search query is required via ?q=...' });
    }

    const matchedTodos = todos.filter(
        (todo) =>
            todo.task.toLowerCase().includes(query.toLowerCase()) ||
            todo.description.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedTodos.length === 0) {
        return res.status(200).json({ message: 'No todos matched your search' });
    }

    res.status(200).json(matchedTodos);
});

// GET todo by ID
app.get('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const todo = findTodoById(id);
    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(todo);
});

// POST - create a new todo item
app.post('/todos', (req, res) => {
    const task = normalizeString(req.body.task);
    const description = normalizeString(req.body.description);

    if (!task) {
        return res.status(400).json({ error: 'Task field is required' });
    }

    if (!description) {
        return res.status(400).json({ error: 'Description field is required' });
    }

    const existingTask = todos.find((todo) => todo.task.toLowerCase() === task.toLowerCase());
    if (existingTask) {
        return res.status(409).json({ error: 'Task already exists' });
    }

    const newTodo = {
        id: ++currentId,
        task,
        description,
        status: 'pending'
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PATCH - partial update of a todo item
app.patch('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const todo = findTodoById(id);
    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    const { task, description, status } = req.body;

    if (task !== undefined) {
        const normalizedTask = normalizeString(task);
        if (!normalizedTask) {
            return res.status(400).json({ error: 'Task must be a non-empty string' });
        }
        todo.task = normalizedTask;
    }

    if (description !== undefined) {
        const normalizedDescription = normalizeString(description);
        if (!normalizedDescription) {
            return res.status(400).json({ error: 'Description must be a non-empty string' });
        }
        todo.description = normalizedDescription;
    }

    if (status !== undefined) {
        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ error: "Status must be 'pending' or 'completed'" });
        }
        todo.status = status;
    }

    res.status(200).json({ message: 'Todo updated successfully', updatedTodo: todo });
});

// DELETE - remove a todo item by ID
app.delete('/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const [deletedTodo] = todos.splice(index, 1);
    res.status(200).json({ message: 'Todo deleted successfully', deleted: deletedTodo, remainingTodos: todos.length });
});

// DELETE all completed todos
app.delete('/todos/completed', (req, res) => {
    const completedCount = todos.filter((todo) => todo.status === 'completed').length;
    todos = todos.filter((todo) => todo.status !== 'completed');

    res.status(200).json({ message: 'Completed todos cleared', cleared: completedCount, remainingTodos: todos.length });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`APP is running on port ${PORT}`);
});