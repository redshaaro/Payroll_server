const express = require("express");
const { getPeriodsByPayrollName } = require("../controllers/PeriodController");

const router = express.Router();

router.get("/getPeriod", getPeriodsByPayrollName);

module.exports = router;
