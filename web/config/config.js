//최대 신청 가능한 과목 수
const max_applied_course_num = 4;

//fetch 요청 제한 - timeInterval(ms)내에 최대 maxRequestNum만큼 fetch 요청할 수 있음
const timeInterval = 5000;
const maxRequestNum = 4; //최소 3번은 돼야 함

module.exports = {
    max_applied_course_num: max_applied_course_num,
    timeInterval: timeInterval, 
    maxRequestNum: maxRequestNum,
};