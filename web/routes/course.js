const express = require("express");
const router = express.Router();
const courseControllers = require('../controllers/course-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.use(authMiddleware.checkAuthentication);

router.get("/course", courseControllers.getCourse);

router.post("/add-course", courseControllers.addCourse);

module.exports = router;
