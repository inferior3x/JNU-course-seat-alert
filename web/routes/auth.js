const db = require("../database/database");

const validation = require('../util/validation');

const bcrypt = require('bcryptjs');

const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.redirect("/signup");
});

router.get("/signup", (req, res) => {
  let inputData = req.session.inputData;
  req.session.inputData = null;
  if (!inputData){
    inputData = {
      error: false,
      id: '',
      password: '',
      password2: '',
    }
  }
  res.render("signup", {inputData: inputData});
});

router.get("/login", (req, res) => {
  let inputData = req.session.inputData;
  req.session.inputData = null;
  if (!inputData){
    inputData = {
      error: false,
      id: '',
      password: '',
    }
  }
  res.render("login", {inputData: inputData});
});

router.post("/signup", async (req, res) => {
  //입력값 유효성 검사
  const enteredId = req.body['user-id'];
  const enteredPassword = req.body['user-pw'];
  const enteredPassword2 = req.body['user-pw2'];

  if ( !validation.isSignupInfoValid(enteredId, enteredPassword, enteredPassword2)){
    
    req.session.inputData = {
      error: true,
      message: '기입 정보를 다시 확인해주세요.',
      id: enteredId,
      password: enteredPassword,
      password2: enteredPassword2,
    }
    req.session.save(() => res.redirect('/signup'));
    return;
  }

  //아이디 중복 확인
  const existingUser = await db.getDb().collection('users').findOne({id: enteredId});
  if (existingUser){
    req.session.inputData = {
      error: true,
      message: '해당 아이디는 사용할 수 없습니다.',
      id: enteredId,
      password: enteredPassword,
      password2: enteredPassword2,
    }
    req.session.save(() => res.redirect('/signup'));
    return;
  }

  //아이디 생성
  const hashedPassword = await bcrypt.hash(enteredPassword, 12);
  await db.getDb().collection('users').insertOne({
    id: enteredId, 
    password: hashedPassword, 
    isAdmin: false,
    //subjects: [{subject: objid, seatType: boolean}, {} ...],
    //pushToken: '',
  });

  //자동 로그인

  res.redirect("/login");
});

router.post('/login', async (req, res) => {
  //아이디 존재하는지 확인
  const enteredId = req.body['user-id'];
  const enteredPassword = req.body['user-pw'];

  const user = await db.getDb().collection('users').findOne({id: enteredId});
  if (!user) {
    req.session.inputData = {
      error: true,
      message: '아이디 혹은 비밀번호가 일치하지 않습니다.',
      id: enteredId,
      password: enteredPassword,
    }
    req.session.save(() => res.redirect('/login'));
    return;
  }

  //비밀번호 맞는지 확인
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, user.password);
  if(!isPasswordCorrect){
    req.session.inputData = {
      error: true,
      message: '아이디 혹은 비밀번호가 일치하지 않습니다.',
      id: enteredId,
      password: enteredPassword,
    }
    req.session.save(() => res.redirect('/login'));
    return;
  }

  //로그인, 세션 쿠키 추가
  req.session['user-info'] = {
    id: enteredId,
  }
  req.session.isAuthenticated = false;
  req.session.save(() => res.redirect('/subject'));
});

//로그아웃 추가 - user-info null isAthenticated null (세션 삭제)


module.exports = router;
