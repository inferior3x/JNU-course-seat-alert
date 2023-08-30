function isSignupInfoValid(id, password1, password2){
    const pattern = /^[A-Za-z0-9_-]*$/;
    if (!id.trim())
        return {error: true, message: '아이디를 입력해주세요.'}
    if (!pattern.test(id))
        return {error: true, message: '아이디는 영문자, 숫자, 대시, 언더바만 사용할 수 있습니다.'}
    if (!(password1 === password2))
        return {error: true, message: '비밀번호가 같지 않습니다.'}
    if (!(password1.trim().length > 7))
        return {error: true, message: '8자리 이상인 비밀번호를 입력해주세요.'}
    return {error: false};
}

function isCourseInfoValid(name, code, grade, type){
    return name.trim() &&
    code.trim() &&
    parseInt(grade) > 0 &&
    parseInt(type) >= 0 ;
}

function isUndefined(...data){
    for (datum of data)
        if (datum === undefined)
            return true;
    return false;
}

module.exports = {isSignupInfoValid: isSignupInfoValid, isCourseInfoValid: isCourseInfoValid, isUndefined:isUndefined};