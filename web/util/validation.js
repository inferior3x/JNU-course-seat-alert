function isSignupInfoValid(id, password1, password2){
    return id.trim() &&
    password1.trim().length > 7 &&
    password1 === password2;
}

module.exports = {isSignupInfoValid: isSignupInfoValid};