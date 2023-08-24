const bcrypt = require('bcryptjs');
const User = require('../models/user');
const validation = require('../util/validation');
const validationSession = require('../util/validation-session');

function gotoSignup(req, res) {
    res.redirect("/signup");
}

function getSignup(req, res) {
    if (res.locals.isAuthenticated)
        return res.redirect('/course');

    // let inputData = validationSession.getErrorInputData(req);
    // if (!inputData)
    //   inputData = validationSession.getEmptyInputData(
    //     {
    //       id: '',
    //       password: '',
    //       password2: '',
    //     }
    //   );
    // res.render("signup", {inputData: inputData});
    res.render("signup");
}

function getLogin(req, res) {
    if (res.locals.isAuthenticated)
    return res.redirect('/course');

    // let inputData = validationSession.getErrorInputData(req);
    // if (!inputData)
    //   inputData = validationSession.getEmptyInputData(
    //     {
    //       id: '',
    //       password: '',
    //     }
    //   );
    // res.render("login", {inputData: inputData});
    res.render("login");
}

async function signup(req, res) {
    const enteredId = req.body['user-id'];
    const enteredPassword = req.body['user-pw'];
    const enteredPassword2 = req.body['user-pw2'];
  
    //입력값 유효성 검사
    if ( !validation.isSignupInfoValid(enteredId, enteredPassword, enteredPassword2)){
      // validationSession.setErrorInputData(req, 
      //   '기입 정보를 다시 확인해주세요.', 
      //   {
      //     id: enteredId,
      //     password: enteredPassword,
      //     password2: enteredPassword2,
      //   },
      //   () => res.redirect('/signup')
      // )
      // return;
      return res.json({error: true, message: '기입 정보를 다시 확인해주세요.'});
    }
  
    //아이디 중복 확인
    const user = new User(enteredId);
    if (await user.checkExistence()){
      // validationSession.setErrorInputData(req, 
      //   '해당 아이디는 사용할 수 없습니다.', 
      //   {
      //     id: enteredId,
      //     password: enteredPassword,
      //     password2: enteredPassword2,
      //   },
      //   () => res.redirect('/signup')
      // )
      // return;
      return res.json({error: true, message: '해당 아이디는 사용할 수 없습니다.'});
    }
  
    //아이디 생성
    user.password = await bcrypt.hash(enteredPassword, 12);
    await user.create();
  
    //자동 로그인
  
    res.json({error: false});
}

async function login(req, res) {
    const enteredId = req.body['user-id'];
    const enteredPassword = req.body['user-pw'];
  
    const user = new User(enteredId);
    await user.find();
  
    //유저 존재하지 않을 때
    if (!user._id) {
      // validationSession.setErrorInputData(req, 
      //   '아이디 혹은 비밀번호가 일치하지 않습니다.', 
      //   {
      //     id: enteredId,
      //     password: enteredPassword,
      //   },
      //   () => res.redirect('/login')
      // )
      // return;
      return res.json({error: true, message: '아이디 혹은 비밀번호가 일치하지 않습니다.'});
    }
  
    //비밀번호 맞는지 확인
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, user.password);
    if(!isPasswordCorrect){
      // validationSession.setErrorInputData(req, 
      //   '아이디 혹은 비밀번호가 일치하지 않습니다.', 
      //   {
      //     id: enteredId,
      //     password: enteredPassword,
      //   },
      //   () => res.redirect('/login')
      // )
      // return;
      return res.json({error: true, message: '아이디 혹은 비밀번호가 일치하지 않습니다.'});
    }
  
    //로그인, 세션 쿠키 추가
    req.session['user'] = {
      id: enteredId,
    }
    req.session.isAuthenticated = true;
    req.session.save(() => res.json({error: false}));
}


module.exports = {gotoSignup:gotoSignup, getSignup:getSignup, getLogin:getLogin, signup:signup, login:login};