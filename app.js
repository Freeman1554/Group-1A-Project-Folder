
const express = require('express');
const Users = require('./models/user');
const app = express();
const PORT = 4000;
app.use(express.json());



app.post('/user', Users )


//Start Server
app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
});

