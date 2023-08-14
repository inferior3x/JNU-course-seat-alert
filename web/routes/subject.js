const express = require("express");
const router = express.Router();
const subjectControllers = require('../controllers/subject-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.use(authMiddleware.checkAuthentication);

router.get("/subject", subjectControllers.getSubject);


module.exports = router;
