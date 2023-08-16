function isSignupInfoValid(id, password1, password2){
    return id.trim() &&
    password1.trim().length > 7 &&
    password1 === password2;
}

function isCourseInfoValid(name, code, grade, type){
    return name.trim() &&
    code.trim() &&
    parseInt(grade) > 0 &&
    parseInt(type) >= 0 ;
}

module.exports = {isSignupInfoValid: isSignupInfoValid, isCourseInfoValid: isCourseInfoValid};