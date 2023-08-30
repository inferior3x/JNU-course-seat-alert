function checkAuthentication(req, res, next){
    if (!res.locals.isAuthenticated)
        if (req.headers['sec-fetch-mode'] === 'cors')
            return res.status(401).json();
        else
            return res.redirect('/401');
    return next();
}

function checkAuthority(req, res, next){
}

module.exports = {checkAuthentication: checkAuthentication, checkAuthority: checkAuthority};