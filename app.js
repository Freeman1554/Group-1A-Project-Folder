require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
app.use(express.json());



let todos = [
    { id: 1, task: "Learn Node.js", status: "pending", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, task: "Build CRUD API", status: "pending", createdAt: new Date(), updatedAt: new Date() }
];



const userRouter = require("./routes/User");
app.use("/users", userRouter)

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

//Start Server
app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
});

