//session 관련 혹은 session을 다루는 작업들

const config = require('../config/config');

function setDefaultSessionKeyValue(req, res, next){
    if (!req.session.requestTime){
        req.session.requestTime = new Date();
        req.session.requestNum = 0;
    }
    return next();
}

function setLocals(req, res, next){
    const user = req.session.user;
    const isAuthenticated = req.session.isAuthenticated;

    if (!user || !isAuthenticated)
        return next();

    res.locals.user = user;
    res.locals.isAuthenticated = isAuthenticated;

    next();
}

function checkTooManyFetch(req, res, next) {
    const secFetchMode = req.headers['sec-fetch-mode'];
    if (secFetchMode === 'cors') {
        const currentTime = new Date();
        const requestNum = req.session.requestNum;
        const requestTime = req.session.requestTime;

        //여러 요청했는지 확인하는 코드
        if (currentTime - requestTime > config.timeInterval){ //이전 요청과 현재 요청의 시간 차가 일정 시간보다 클 때
            //초기화
            req.session.requestNum = 0;
            req.session.requestTime = currentTime;
        }else{ //작을 때
            if (requestNum >= config.maxRequestNum) //요청 가능 횟수 넘었을 때
                //가중치 적용해도 될 듯
                return res.status(429).json();
        }
        req.session.requestNum += 1;
    }
    return next();
}

module.exports = {setDefaultSessionKeyValue:setDefaultSessionKeyValue, setLocals:setLocals, checkTooManyFetch:checkTooManyFetch};