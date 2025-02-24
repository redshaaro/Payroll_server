const express = require("express");
const upload = require("../lib/multer");
const { getEntry } = require("../controllers/TestController");

const router = express.Router();

router.get("/getenteries", getEntry);

module.exports = router;
