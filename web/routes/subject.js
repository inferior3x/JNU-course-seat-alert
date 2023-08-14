const db = require("../database/database");

const validation = require('../util/validation');

const express = require("express");
const router = express.Router();

const authMiddleware = require('../middlewares/auth-middleware');


router.use(authMiddleware.checkAuthentication);

router.get("/subject", (req, res) => {

  res.render("subject");
});


module.exports = router;