const Course = require('../models/course');
const Session = require('../models/session');
const pushNotification = require('./push-notification');

function handleMutatedCourses(seatChecker){
    seatChecker.addListener(async (data) => {
        const lines = data.toString().trim().split('\n');
        for (const line of lines){
            const parsedData = JSON.parse(line);

            //seat-checker.py로부터 받은 데이터 처리
            if (parsedData.type === 'log'){ //log일 경우 파일에 저장
                console.log(parsedData.data);

            }else if (parsedData.type === 'finding'){ //finding일 경우 여석이 변동된 과목들 받고 푸시 알림
                // console.log(parsedData.data);
                //과목들마다 작업
                for (const mutatedCourse of parsedData.data) { //mutatedCourse = ['과목코드', 자과 -1(그대로)/0(사라짐)/1(생김), 타과 -1/0/1]
                    const [courseCode, selfStatus, otherStatus] = mutatedCourse;
                    //과목의 정보 가져오기
                    const course = new Course(courseCode);
                    await course.fetchCourse({});

                    //alerted 설정
                    if (selfStatus !== -1)
                        course.alertedSelf = selfStatus;
                    if (otherStatus !== -1)
                        course.alertedOther = otherStatus;
                    await course.modify({$set: {alertedSelf: course.alertedSelf, alertedOther: course.alertedOther}});
                    
                    //과목의 신청자들마다 작업
                    for (const applicant of course.applicants){ // applicant = {userId: 'userid', 'type': '0(자과)/1(타과)'}
                        // 자/타과 구분이 맞지 않는 사용자면 넘어가기
                        const status = applicant.type === '1' ? otherStatus : selfStatus ;
                        if (status === -1)
                            continue;
                        
                        const session = new Session(applicant.userId);
                        if (await session.isExistingSession()){ //세션 존재할 때
                            await session.fetchSession({_id: 0, 'session.user.pushToken': 1});
                            const pushToken = session.session.user.pushToken;
                            if (pushToken){ //푸시 토큰이 있을 때
                                //푸시 알람 보내기
                                await pushNotification.sendPushNotification(pushToken, 
                                    status ? '여석이 생겼습니다!' : '여석이 사라졌습니다...',
                                    course.name, {}
                                );
                                // console.log(`pushed ${courseCode} to ${applicant.userId}`);
                            }
                        }
                    }
                }
            }
        }
    });
}

module.exports = {handleMutatedCourses:handleMutatedCourses}