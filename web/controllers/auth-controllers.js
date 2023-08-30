const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Session = require('../models/session');
const validation = require('../util/validation');

//회원가입 페이지로 리다이렉션
function gotoSignup(req, res) {
    res.redirect("/signup");
}

//회원가입 페이지 렌더링
function getSignup(req, res) {
    if (res.locals.isAuthenticated)
        return res.redirect('/course');
    res.render("signup");
}

//로그인 페이지 렌더링
function getLogin(req, res) {
    if (res.locals.isAuthenticated)
      return res.redirect('/course');
    res.render("login");
}

//회원가입 요청
async function signup(req, res) {
    const enteredId = req.body['user-id'];
    const enteredPassword = req.body['user-pw'];
    const enteredPassword2 = req.body['user-pw2'];

    //받은 데이터에 필요한 속성이 존재하는지 확인
    if (validation.isUndefined(enteredId, enteredPassword, enteredPassword2))
      return res.json({error: true, message: '올바르지 않은 접근입니다.'});

    //입력값 유효성 검사
    const signupInfoVaildResult = validation.isSignupInfoValid(enteredId, enteredPassword, enteredPassword2);
    if (signupInfoVaildResult.error){
      return res.json({error: true, message: signupInfoVaildResult.message});
    }
  
    //아이디 중복 확인
    const user = new User(enteredId);
    if (await user.checkExistence()){
      return res.json({error: true, message: '해당 아이디는 사용할 수 없습니다.'});
    }

    //아이디 생성
    user.password = await bcrypt.hash(enteredPassword, 12);
    await user.create();
  
    res.json({error: false});
}

//로그인 요청
async function login(req, res) {
    const enteredId = req.body['user-id'];
    const enteredPassword = req.body['user-pw'];
    const pushToken = req.body['push-token'];

    //받은 데이터에 필요한 속성이 존재하는지 확인
    if (validation.isUndefined(enteredId, enteredPassword, pushToken))
      return res.json({error: true, message: '올바르지 않은 접근입니다.'});

    //유저 데이터 가져오기
    const user = new User(enteredId);
    await user.fetchUserData();
  
    //유저 존재하지 않을 때 리턴
    if (!user._id)
      return res.json({error: true, message: '아이디 혹은 비밀번호가 일치하지 않습니다.'});
  
    //비밀번호 틀릴 때 리턴
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, user.password);
    if(!isPasswordCorrect)
      return res.json({error: true, message: '아이디 혹은 비밀번호가 일치하지 않습니다.'});
    
    //토큰 없을 때 리턴
    if (!pushToken.includes('Exponent')) //pushToken = ExponentPushToken[...]
      return res.json({error: true, message: '토큰 없음'});

    //위 조건을 모두 통과했을 때 로그인 수행
    
    //같은 계정 및 같은 디바이스의 세션들을 로그아웃
    const session = new Session(user.id, pushToken); 
    await session.logoutSessionsById(); //아이디가 같은 세션(자동 로그아웃 기능 + 여러 기기로 알림 보내기 방지)
    await session.logoutSessionsByPushToken(); //푸시 토큰이 같은 세션(한 기기에서 패러렐즈 같은걸 사용하여 여러 계정으로 알림을 받는 것을 방지)

    //세션 쿠키 추가
    req.session['user'] = {
      id: enteredId,
      pushToken: pushToken,
    }
    req.session.isAuthenticated = true;
    req.session.save(() => res.json({error: false}));
}


module.exports = {gotoSignup:gotoSignup, getSignup:getSignup, getLogin:getLogin, signup:signup, login:login};