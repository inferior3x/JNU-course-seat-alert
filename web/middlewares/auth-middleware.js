
function checkAuthentication(req, res, next){
    if (!req.session.isAuthenticated){
        return res.redirect('/401');
    }
    return next();
}

function checkAuthority(req, res, next){
    //
}

module.exports = {checkAuthentication: checkAuthentication, checkAuthority: checkAuthority};