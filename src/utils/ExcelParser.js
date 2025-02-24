const xlsx = require("xlsx");

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames; // Get all sheet names
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]); // Parse the first sheet
  return data;
};

module.exports = parseExcel;
