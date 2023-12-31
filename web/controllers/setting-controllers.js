const User = require('../models/user');
const Course = require('../models/course');
const Session = require('../models/session');

//계정 초기화
async function initAccount(req, res) {
    const userId = res.locals.user.id;
    const user = new User(userId);

    //db에 계정 없는지
    if (!await user.checkExistence())
        return res.json({error: true, message: '계정이 존재하지 않습니다.'});

    //신청해둔 과목들 삭제
    await Course.deleteApplicantFromAll(userId);

    //유저의 신청 과목 수 초기화
    await user.modify({$set: {applied_course_num: 0}});

    return res.json({error: false});
}

//계정 탈퇴
async function deleteAccount(req, res) {
    const userId = res.locals.user.id;
    const session = new Session(userId);
    const user = new User(userId);

    //db에 계정 없는지
    if (!await user.checkExistence())
        return res.json({error: true, message: '계정이 존재하지 않습니다.'});

    //신청한 과목들 삭제
    await Course.deleteApplicantFromAll(userId);

    //세션 삭제
    await session.deleteSessionsById();

    //유저 삭제
    await user.deleteUserById();

    return res.json({error: false});
}

//로그아웃
async function logout(req, res) {
    const userId = res.locals.user.id;
    const session = new Session(userId);

    //세션의 인증 - false
    await session.logoutSessionsById();
    
    return res.json({error: false});
}


module.exports = {initAccount:initAccount, deleteAccount:deleteAccount, logout:logout}