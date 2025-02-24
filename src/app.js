const express = require('express');



const excelRoutes = require("./routes/ExcelRoutes");
const enteryRoutes = require("./routes/EnteryRoutes")
const TestRoutes = require("./routes/TestRoutes")
const InputRoutes = require("./routes/InputRoutes")

const cors = require("cors");








// const prisma = new PrismaClient();
const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/excel", excelRoutes);
app.use("/api/entery", enteryRoutes)
app.use("/api/inputs", InputRoutes)

app.use("/api/test", TestRoutes)










module.exports = { app };


