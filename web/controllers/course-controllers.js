const User = require('../models/user');
const Course = require('../models/course');
const {ObjectId} = require('mongodb');
const validation = require('../util/validation');
const process = require('../app');
const userConfig = require('../config/user-config');
const {courseSearchingErrMsg} = require('../util/messages');


//course 페이지 렌더링
async function getCourse(req, res) {
    const courses = await Course.findCoursesByApplicantId(res.locals.user.id);
    res.render("course", {courses: courses});
}

//신청한 과목들 보내기
async function fetchCourse(req, res) {
    const courses = await Course.findCoursesByApplicantId(res.locals.user.id);
    res.json({error:false, courses: courses});
}

//알림 신청한 사용자를 과목에 추가하기
async function addApplicantToCourse(req, res){
    const {name, code, grade, type} = req.body;
    
    if (!validation.isCourseInfoValid(name, code, grade, type))
        return res.json({error: true, message: '유효하지 않은 입력입니다.'});

    //db에 등록된 수업이 있는지 확인
    const course = new Course(code);
    const userId = res.locals.user.id;
    if (!await course.isExistingCourse()){//db에 등록된 수업이 없을 때 크롤링
        process.courseSearcher.passData({id: userId, name: name, code: code, grade: grade});
        const result = await process.courseSearcher.receiveData(); // result = {'errorType': -1, 'name': '과목이름'}

        if (result.errorType > 0)//크롤링 오류 발생
            return res.json({error: true, message: courseSearchingErrMsg[result.errorType]}); //오류 메세지 전달하기

        course.name = result.name;
        course.grade = grade;
        await course.create();
    }

    //이미 해당 과목 신청한 사람인 지 확인
    if (await course.isExistingApplicant(userId))
        return res.json({error: true, message: '신청된 과목입니다.'});
    
    //신청한 과목이 최대일 경우
    const user = new User(userId);
    await user.fetchUserData({_id: 0, applied_course_num: 1});
    if (user.applied_course_num >= userConfig.max_applied_course_num)
        return res.json({error: true, message: `신청 가능한 최대 과목 수는 ${userConfig.max_applied_course_num}개입니다.`});

    
    //과목에 신청자 추가하기
    await course.modify({$push: {applicants: {
        userId: userId,
        type: type,
    }}});
    //신청자가 신청한 과목 수++
    await user.modify({$inc: {applied_course_num: 1}});

    return res.json({error: false});
}

//신청한 과목 삭제
async function deleteApplicantFromCourse(req, res) {
    const userId = res.locals.user.id;
    //과목으로부터 신청자 삭제
    const course = new Course(req.body.code);
    await course.deleteApplicantFromOne(userId);
    //신청한 과목 수--
    const user = new User(userId);
    await user.modify({$inc: {applied_course_num: -1}});
    return res.json({error: false});
}

module.exports = {getCourse:getCourse, addApplicantToCourse:addApplicantToCourse, deleteApplicantFromCourse: deleteApplicantFromCourse, fetchCourse:fetchCourse};