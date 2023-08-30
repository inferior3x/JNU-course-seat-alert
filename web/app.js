const path = require("path");

const express = require("express");
const session = require('express-session');

const sessionConfig = require('./config/session-config');

const db = require('./database/database');

const csrf = require('csurf');

const sessionMiddleware = require('./middlewares/session-middleware');
const csrfMiddleware = require('./middlewares/csrf-middleware');

const authRouter = require("./routes/auth");
const courseRouter = require("./routes/course");
const settingRouter = require("./routes/setting");

const PythonSpawn = require('./util/python-spawn');
const mutatedCourse = require('./util/mutated-course');

// run course-searcher.py
const courseSearcher = new PythonSpawn('course-searcher.py');
courseSearcher.spawnPython();
module.exports.courseSearcher = courseSearcher;

// run seat-checker.py
const seatChecker = new PythonSpawn('seat-checker-mp.py');
seatChecker.spawnPython();
mutatedCourse.handleMutatedCourses(seatChecker);
module.exports.seatChecker = seatChecker;

//server
const app = express();

//mongodb session
const mongodbSessionStore = sessionConfig.createMongodbSessionStore(session);
app.use(session(sessionConfig.createMongodbSession(mongodbSessionStore)));
app.use(sessionMiddleware.setDefaultSessionKeyValue);

//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//static files
app.use(express.static("public"));

//decode urlencoded data
app.use(express.urlencoded({ extended: true }));
//decode json encoded data
app.use(express.json());

//prevent user from making too many fetch
app.use(sessionMiddleware.checkTooManyFetch);

//csrf
app.use(csrf());
app.use(csrfMiddleware.setLocalCsrfToken);

//session to locals
app.use(sessionMiddleware.setLocals);

//401
app.get('/401', (req, res) => res.status(401).render('401'));

//routers
app.use(authRouter);
app.use(courseRouter);
app.use(settingRouter);

//404
app.use((req, res) => res.status(404).render('404'));

//500
app.use(function (error, req, res, next) {
  console.log(error);
  const fetchMode = req.headers['sec-fetch-mode'];
  if (fetchMode === 'navigate')
    res.status(500).render("500");
  else (fetchMode === 'cors')
    res.status(500).json();
});

db.connectToDatabase().then(() => app.listen(3000));
