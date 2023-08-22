const {wait} = require('./async');

async function handleAvailableCourses(seatChecker){
    seatChecker.addListener((data) => {
        const lines = data.toString().trim().split('\n')
        for (const line of lines){
            const parsedData = JSON.parse(line);
            if (parsedData.type === 'log'){ //log일 경우 파일에 저장
                console.log(parsedData.data);
            }else if (parsedData.type === 'finding'){ //과목을 찾았을 경우
                console.log(parsedData);
            }
        }
    });
    while (true){
        await wait(2000)
        //console.log(seatChecker);
        
        //들어오는 데이터 받기
            //로그 받으면 로그 파일에 저장
            
            //강의 받으면 사용자에게 푸시 보내기
    }
}

module.exports = {handleAvailableCourses:handleAvailableCourses}