const express = require("express");
const router = express.Router();
const courseControllers = require('../controllers/course-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.use(authMiddleware.checkAuthentication);

router.get("/course", courseControllers.getCourse);

router.get("/fetch-course", courseControllers.fetchCourse);

router.post("/add-course", courseControllers.addCourse);

router.post("/delete-course", courseControllers.deleteCourse);

module.exports = router;
