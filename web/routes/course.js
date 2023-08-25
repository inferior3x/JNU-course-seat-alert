const express = require("express");
const router = express.Router();
const courseControllers = require('../controllers/course-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.use(authMiddleware.checkAuthentication);

router.get("/course", courseControllers.getCourse);

router.get("/fetch-course", courseControllers.fetchCourse);

router.post("/add-course", courseControllers.addApplicantToCourse);

router.post("/delete-course", courseControllers.deleteApplicantFromCourse);

module.exports = router;
