const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
// const fileAccess = require('./util/file-access');

const routes = require("./routes/routes");
const express = require("express");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

//routes
app.use(routes);

//error pages
app.use(function(req, res) {
    res.status(404).render('404');
});
app.use(function (error, req, res, next) {
  console.log(error);
  res.status(500).render("500");
});

app.listen(3000);
