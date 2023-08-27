function checkAuthenticationForForm(req, res, next){
    if (!res.locals.isAuthenticated)
        return res.redirect('/401');
    return next();
}
function checkAuthenticationForFetch(req, res, next){
    if (!res.locals.isAuthenticated)
        return res.status(401).json();
    return next();
}

function checkAuthority(req, res, next){
    //
}

module.exports = {checkAuthenticationForForm: checkAuthenticationForForm,checkAuthenticationForFetch: checkAuthenticationForFetch, checkAuthority: checkAuthority};