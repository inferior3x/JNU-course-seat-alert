const express = require('express');
const router = express.Router();
const settingControllers = require('../controllers/setting-controllers');
const authMiddleware = require("../middlewares/auth-middleware");

router.post('/init-account', authMiddleware.checkAuthentication, settingControllers.initAccount);

router.post('/delete-account', authMiddleware.checkAuthentication, settingControllers.deleteAccount);

router.post('/logout', authMiddleware.checkAuthentication, settingControllers.logout);

module.exports = router;