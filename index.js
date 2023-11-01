
const express = require('express');
const mongoose= require('mongoose');
const app = express();

 mongoose.connect("mongodb://127.0.0.1:27017/Ecommerse");
//  mongodb://127.0.0.1:27017

 // user routes
const user_routes = require("./routes/userRoute");
const store_route = require('./routes/storeRoute');

app.use('/api',user_routes);


// store routes
const_routes = require("./routes/storeRoute");
 app.use('/api',store_route);

 
 app.listen(3000,() => {
    console.log("Server is ready"); 
 })
