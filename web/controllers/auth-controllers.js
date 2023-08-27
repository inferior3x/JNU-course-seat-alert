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

    //입력값 유효성 검사
    if ( !validation.isSignupInfoValid(enteredId, enteredPassword, enteredPassword2)){
      return res.json({error: true, message: '기입 정보를 다시 확인해주세요.'});
    }
  
    //아이디 중복 확인
    const user = new User(enteredId);
    if (await user.checkExistence()){
      return res.json({error: true, message: '해당 아이디는 사용할 수 없습니다.'});
    }

    //아이디 생성
    user.password = await bcrypt.hash(enteredPassword, 12);
    await user.create();
  
    //자동 로그인?
  
    res.json({error: false});
}

//로그인 요청
async function login(req, res) {
    const enteredId = req.body['user-id'];
    const enteredPassword = req.body['user-pw'];
    const pushToken = req.body['push-token'];
    console.log(pushToken);

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
    if (!pushToken.includes('Expo')) //pushToken = ExponentPushToken[...]
      return res.json({error: true, message: '토큰 없음'});

    //위 조건을 모두 통과했을 때 로그인 수행
    
    //세션 삭제
    const session = new Session(user.id, pushToken); 
    await session.deleteSessionsById(); //아이디가 같은 세션은 다 삭제(자동 로그아웃 기능 + 여러 기기로 알림 보내기 방지)
    await session.deleteSessionsByPushToken(); //푸시 토큰이 같은 세션 다 삭제(한 기기에서 패러렐즈 같은걸 사용하여 여러 계정으로 알림을 받는 것을 방지)

    //세션 쿠키 추가
    req.session['user'] = {
      id: enteredId,
      pushToken: pushToken,
    }
    req.session.isAuthenticated = true;
    req.session.save(() => res.json({error: false}));
}


module.exports = {gotoSignup:gotoSignup, getSignup:getSignup, getLogin:getLogin, signup:signup, login:login};