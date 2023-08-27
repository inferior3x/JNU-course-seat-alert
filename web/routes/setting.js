const express = require('express');
const router = express.Router();
const settingControllers = require('../controllers/setting-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.post('/init-account', authMiddleware.checkAuthenticationForFetch, settingControllers.initAccount);

router.post('/delete-account', authMiddleware.checkAuthenticationForFetch, settingControllers.deleteAccount);

router.post('/logout', authMiddleware.checkAuthenticationForFetch, settingControllers.logout);

module.exports = router;