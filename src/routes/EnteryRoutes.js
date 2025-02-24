const express = require("express");
const upload = require("../lib/multer");
const { submitEntry } = require("../controllers/EnteryController");

const router = express.Router();

router.post("/submit", submitEntry);

module.exports = router;
