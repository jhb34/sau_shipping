const express = require("express");
const router = express.Router();
const sql = require("mssql");

const config = {
  user: "usa_user",
  password: "Auto2",
  server: "192.168.1.10",
  database: "USA_ERP",
  port: 1433,
  options: {
    encrypt: false,
  },
};

sql.connect(config).catch((err) => console.log(err));

router.post("/getorder", (req, res) => {
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

module.exports = router;
