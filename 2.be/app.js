const express = require("express");
const cors = require("cors");
const cookie = require("cookie-parser");
const session = require("express-session");
require("dotenv").config({ path: "mongodb/.env" });
const app = express();

app.use(express.json());
app.use(cookie());
app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 1,
    },
  })
);

app.use(
  cors({
    origin: "http://172.20.2.122:8080",
    optionsSuccessStatus: 200, //없어도 됨
    credentials: true, //꼭필요
  })
);

// const a = require("./route/a");
// app.use("/", a);

app.listen(3000, function () {
  console.log("listening on 3000");
});
