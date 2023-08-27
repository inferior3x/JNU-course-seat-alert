const express = require('express');
const router = express.Router();
const settingControllers = require('../controllers/setting-controllers');


router.post('/init-account', settingControllers.initAccount);

router.post('/delete-account', settingControllers.deleteAccount);

router.post('/logout', settingControllers.logout);

module.exports = router;