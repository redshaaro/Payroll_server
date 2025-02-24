const express = require("express");
const upload = require("../lib/multer");
const { generateExcel,uploadFile  } = require("../controllers/ExcelController");

const router = express.Router();


router.get("/generate", generateExcel);
router.post("/upload-file", upload.single("file"), uploadFile);


module.exports = router;
