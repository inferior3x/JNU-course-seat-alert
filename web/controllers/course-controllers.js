const User = require('../models/user');
const Course = require('../models/course');
const {ObjectId} = require('mongodb');
const validation = require('../util/validation');
const process = require('../app');
const {courseSearchingErrMsg} = require('../util/messages');

async function getCourse(req, res) {
    const user = new User(res.locals.user.id);
    await user.fetchUserData({_id: 1})
    
    const courses = await Course.findCoursesByApplicant(user._id);
    res.render("course", {courses: courses});
}

async function fetchCourse(req, res) {
    const user = new User(res.locals.user.id);
    await user.fetchUserData({_id: 1})
    
    const courses = await Course.findCoursesByApplicant(user._id);
    res.json({courses: courses});
}

async function addApplicantToCourse(req, res){
    const {name, code, grade, type} = req.body;
    
    if (!validation.isCourseInfoValid(name, code, grade, type)){
        return res.json({error: true, message: '유효하지 않은 입력입니다.'});
    }

    //db에 등록된 수업이 있는지 확인
    const course = new Course(code);
    if (!await course.isExistingCourse()){//db에 등록된 수업이 없을 때 크롤링
        process.courseSearcher.passData({id: res.locals.user.id, name: name, code: code, grade: grade});
        const result = await process.courseSearcher.receiveData(); // result = {'errorType': -1, 'name': '과목이름'}

        if (result.errorType > 0)//크롤링 오류 발생
            return res.json({error: true, message: courseSearchingErrMsg[result.errorType]}); //오류 메세지 전달하기


        course.name = result.name;
        course.grade = grade;
        await course.create();
        console.log(`강의 없어서 저장함`);
    }else{
        console.log(`강의 있어서 그대로 진행`);
    }
    
    //사용자 _id 불러오기
    const user = new User(res.locals.user.id);
    await user.fetchUserData({_id: 1});

    //이미 해당 과목 신청한 사람인 지 확인
    if (await course.isExistingApplicant(user._id)){
        return res.json({error: true, message: '신청된 과목입니다.'}); //이미 신청한 유저라고 알리기
    }
    
    //과목에 신청자 추가하기
    await course.modify({$push: {applicants: {
        user: new ObjectId(user._id),
        type: type,
    }}});
    return res.json({error: false});
}

async function deleteApplicantFromCourse(req, res) {
    const course = new Course(req.body.code);
    const user = new User(res.locals.user.id);
    await user.fetchUserData({_id: 1});
    await course.deleteApplicant(user._id);
    return res.json({error: false});
}

module.exports = {getCourse:getCourse, addApplicantToCourse:addApplicantToCourse, deleteApplicantFromCourse: deleteApplicantFromCourse, fetchCourse:fetchCourse};