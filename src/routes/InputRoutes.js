const express = require("express");
const { getInputs } = require("../controllers/InputController");

const router = express.Router();

router.get("/getInputs", getInputs);

module.exports = router;
