const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000;

// In-memory database
let tasks = [];
let idCounter = 1;

// ✅ Home route (fixes "Cannot GET /")
app.get('/', (req, res) => {
res.send('Task Manager API is running...');
});

// ✅ CREATE TASK
app.post('/tasks', (req, res) => {
const { title, description, status } = req.body;

if (!title || !description) {  
    return res.status(400).json({  
        message: "Title and description are required"  
    });  
}  

const newTask = {  
    id: idCounter++,  
    title,  
    description,  
    status: status || "pending"  
};  

tasks.push(newTask);  

res.status(201).json({  
    message: "Task created successfully",  
    task: newTask  
});

});

// ✅ GET ALL TASKS
app.get('/tasks', (req, res) => {
res.json({
total: tasks.length,
tasks: tasks
});
});

// ✅ GET SINGLE TASK
app.get('/tasks/:id', (req, res) => {
const id = parseInt(req.params.id);
const task = tasks.find(t => t.id === id);

if (!task) {  
    return res.status(404).json({  
        message: "Task not found"  
    });  
}  

res.json(task);

});

// ✅ UPDATE TASK
app.put('/tasks/:id', (req, res) => {
const id = parseInt(req.params.id);
const task = tasks.find(t => t.id === id);

if (!task) {  
    return res.status(404).json({  
        message: "Task not found"  
    });  
}  

const { title, description, status } = req.body;  

if (title) task.title = title;  
if (description) task.description = description;  
if (status) task.status = status;  

res.json({  
    message: "Task updated successfully",  
    task  
});

});

// ✅ DELETE TASK
app.delete('/tasks/:id', (req, res) => {
const id = parseInt(req.params.id);
const index = tasks.findIndex(t => t.id === id);

if (index === -1) {  
    return res.status(404).json({  
        message: "Task not found"  
    });  
}  

tasks.splice(index, 1);  

res.json({  
    message: "Task deleted successfully"  
});

});

// ✅ START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
