const express = require("express");
const router = express.Router();
const courseControllers = require('../controllers/course-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/course", authMiddleware.checkAuthenticationForForm, courseControllers.getCourse);

router.get("/fetch-course", authMiddleware.checkAuthenticationForFetch, courseControllers.fetchCourse);

router.post("/add-course", authMiddleware.checkAuthenticationForFetch, courseControllers.addApplicantToCourse);

router.post("/delete-course", authMiddleware.checkAuthenticationForFetch, courseControllers.deleteApplicantFromCourse);

module.exports = router;
