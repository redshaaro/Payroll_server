const parseExcel = require("../utils/excelParser");

const processExcelFile = (file) => {
 
  if (!file) {
    throw new Error("No file uploaded");
  }

  const data = parseExcel(file);
  
  if (!data || data.length === 0) {
    throw new Error("The uploaded file contains no data");
  }

  return data;
};

module.exports = { processExcelFile };
