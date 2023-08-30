const express = require("express");
const router = express.Router();
const courseControllers = require('../controllers/course-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/course", authMiddleware.checkAuthentication, courseControllers.getCourse);

router.get("/fetch-course", authMiddleware.checkAuthentication, courseControllers.fetchCourse);

router.post("/add-course", authMiddleware.checkAuthentication, courseControllers.addApplicantToCourse);

router.post("/delete-course", authMiddleware.checkAuthentication, courseControllers.deleteApplicantFromCourse);

module.exports = router;
