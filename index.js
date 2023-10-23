
const express = require('express');
const mongoose= require('mongoose');
const app = express();

 mongoose.connect("mongodb://127.0.0.1:27017/Ecommerse");

 // user routes
const user_routes = require("./routes/userRoute");

app.use('/api',user_routes);

 app.listen(3000,() => {
    console.log("Server is ready"); 
 })
