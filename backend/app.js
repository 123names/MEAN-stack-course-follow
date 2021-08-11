const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/posts");

const app = express();
require("dotenv").config({ path: './backend/.env' });

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
app.use("/images", express.static(path.join("backend/images")));

mongoose.connect("mongodb+srv://testDB:"+process.env.DBPASS+"@cluster0.jceaz.mongodb.net/node-angular?retryWrites=true&w=majority")
.then(()=>{
  console.log("Connected to database");
})
.catch(()=>{
  console.log("Connection to database failed");
});


// set header handle CORS error
app.use((request, response, next)=>{
  response.setHeader("Access-Control-Allow-Origin","*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts",postRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
