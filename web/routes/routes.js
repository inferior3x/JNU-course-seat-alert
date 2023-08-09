const db = require("../database/database");
const { v4 } = require("uuid");

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/login");
});
router.get("/login", (req, res) => {
  res.render("index");
});

router.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

router.post("/sign-up", async (req, res) => {
  //아이디 존재 하나 확인하기
  const query = [
    "SELECT * FROM users WHERE user_id = ?",
    "INSERT INTO users (user_id, user_pw, user_uuid) VALUES(?, ?, ?)"
  ];
  const [userData] = await db.query(query[0], [req.body.user_id]);
  if (userData && userData.length !== 0) {
    console.log("id 중복");
    return res.redirect('/sign-up');
  }

  //로그인 구현
  await db.query(query[1], [req.body.user_id, req.body.user_pw, v4()]);
  res.redirect("/login");
});

module.exports = router;
