const express = require("express");
const { test_geturl } = require("../controller/test_url");
const router = express.Router();

router.get("/", test_geturl);

module.exports = router;
