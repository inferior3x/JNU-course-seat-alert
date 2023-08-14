const express = require("express");
const router = express.Router();
const authControllers = require('../controllers/auth-controllers');

router.get("/", authControllers.gotoSignup);

router.get("/signup", authControllers.getSignup);

router.get("/login", authControllers.getLogin);

router.post("/signup", authControllers.signup);

router.post('/login', authControllers.login);

//로그아웃 추가 - user-info null isAthenticated null (세션 삭제)


module.exports = router;
