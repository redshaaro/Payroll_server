const express = require('express');



const excelRoutes = require("./routes/ExcelRoutes");
const enteryRoutes = require("./routes/EnteryRoutes")
const TestRoutes = require("./routes/TestRoutes")
const InputRoutes = require("./routes/InputRoutes")
const PeriodRoutes = require("./routes/PeriodRoutes")
const PayrollRoutes = require("./routes/PayrollRoutes")


const cors = require("cors");








// const prisma = new PrismaClient();
const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/excel", excelRoutes);
app.use("/api/entery", enteryRoutes)
app.use("/api/inputs", InputRoutes)
app.use("/api/period", PeriodRoutes)
app.use("/api/payroll", PayrollRoutes)


app.use("/api/test", TestRoutes)










module.exports = { app };


