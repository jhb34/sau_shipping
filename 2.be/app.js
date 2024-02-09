const express = require("express");
const cors = require("cors");
const cookie = require("cookie-parser");
const session = require("express-session");
require("dotenv").config({ path: ".env" });
const sql = require("mssql");
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

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PW,
  server: "192.168.1.10",
  database: "USA_ERP",
  port: 1433,
  options: {
    encrypt: false,
  },
};

sql
  .connect(config)
  .then(console.log("mssql연결됨"))
  .catch((err) => console.log(err));

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

app.post("/getorder", (req, res) => {
  const { params } = req.body;
  const date = params[0].trim();
  const cust = params[1].trim();
  const request = new sql.Request();
  request.query(
    `select distinct SAL_YMD,CUST_CD,TRAILER_NO, len(TRAILER_NO), NOW_ST from SAL_ORDER where SAL_YMD=${date} and CUST_CD='${cust}' order by len(TRAILER_NO), TRAILER_NO
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});

app.post("/getlist", (req, res) => {
  const { params } = req.body;
  const date = params[0].trim();
  const trailer = params[1].trim();
  const cust = params[2].trim();
  const request = new sql.Request();
  request.query(
    `select TOP 100 * from SAL_ORDER where SAL_YMD=${date} and TRAILER_NO='${trailer}' and CUST_CD='${cust}' order by ITMNO
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});

app.post("/chkdup", (req, res) => {
  const a = req.body.params;
  console.log(a);
  // const date = params[0].trim();
  // const cust = params[1].trim();
  const request = new sql.Request();
  request.query(
    `select top 100 * from  SAL_HIST where STAG_NO='${a}' and NOW_ST='1'
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});
app.post("/chkpo", (req, res) => {
  const a = req.body.params;
  console.log(a);
  // const date = params[0].trim();
  // const cust = params[1].trim();
  const request = new sql.Request();
  request.query(
    `select top 100 * from  TB_PO_INFO where PART_NO='${a}' and CUST_CODE='${a}'
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});
app.post("/chkitmno", (req, res) => {
  const a = req.body.params;
  console.log(a);
  // const date = params[0].trim();
  // const cust = params[1].trim();
  const request = new sql.Request();
  request.query(
    `select top 100 * from ITM_MST where ITMNO='${a}'
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      console.log(result);
      res.send(result);
    }
  );
});

app.post("/getscandetail", (req, res) => {
  const { params } = req.body;
  const date = params[0].trim();
  const trailer = params[1].trim();
  const itm = params[2].trim();
  const request = new sql.Request();
  request.query(
    `select TOP 100 * from SAL_HIST where SAL_YMD=${date} and TRAILER_NO='${trailer}' order by OUT_FLAG desc
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});

app.post("/inserthist", (req, res) => {
  const { params } = req.body;
  console.log(params);
  const selectd = params[0];
  const scand = params[1];
  const today1 = params[2];
  const today2 = params[3];
  const code = params[4];
  const request = new sql.Request();
  request.query(
    `insert into SAL_HIST values('${scand.TMP_ITMNO}','${scand.TMP_SERNO}','${today1}',${scand.TMP_QTY},'${selectd.SAL_YMD}','${selectd.TRAILER_NO}','${selectd.CUST_CD}','${selectd.ASN_NO}','${code}',${today2},'')
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});
app.post("/updateorder", (req, res) => {
  const { params } = req.body;
  console.log(params);
  const selectd = params[0];
  const scand = params[1];
  const today1 = params[2];
  const today2 = params[3];
  const code = params[4];
  const request = new sql.Request();
  request.query(
    `update SAL_ORDER set SCAN_QTY=$S,SCAN_BOX=$S,SCAN_HM='$S',NOW_ST='$S', where "
      `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.send(result);
    }
  );
});
