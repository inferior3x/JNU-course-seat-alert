function setLocalCsrfToken(req, res, next){
    res.locals.csrfToken = req.csrfToken();
    return next();
}

module.exports = {setLocalCsrfToken:setLocalCsrfToken};