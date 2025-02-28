const express = require("express");
const { getPayroll } = require("../controllers/PayrollController");

const router = express.Router();

router.get("/getPayrollNames", getPayroll);

module.exports = router;
