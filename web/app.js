//const uuid = require("uuid");
const path = require("path");

const express = require("express");
const session = require('express-session');
const sessionConfig = require('./config/session-config');

const db = require('./database/database');

const csrf = require('csurf');
const csrfMiddleware = require('./middlewares/csrf-middleware');

const authRouter = require("./routes/auth");
const subjectRouter = require("./routes/subject");

//
const app = express();

//mongodb session
const mongodbSessionStore = sessionConfig.createMongodbSessionStore(session);
app.use(session(sessionConfig.createMongodbSession(mongodbSessionStore)));

//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

//csrf
app.use(csrf());
app.use(csrfMiddleware.setLocalCsrfToken);

//400
app.get('/401', (req, res) => res.status(401).render('401'));
app.get('/404', (req, res) => res.status(404).render('404'));

//routers
app.use(authRouter);
app.use(subjectRouter);

//500
// app.use(function (error, req, res, next) {
//   console.log(error);
//   res.status(500).render("500");
// });

db.connectToDatabase().then(() => app.listen(3000));
