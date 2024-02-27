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

router.post("/getproductlist", (req, res) => {
  const { params } = req.body;
  console.log(params);
  // const date = params[0].trim();
  // const trailer = params[1].trim();
  // const cust = params[2].trim();
  const request = new sql.Request();
  request.query(
    `select TOP 100 * from SAL_PART where STAG_NO='${params}' order by SCAN_DTTM desc
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
router.post("/chkalc", (req, res) => {
  const a = req.body.params;
  console.log(a);
  const itm = a[0].trim();
  const alc = a[1].trim();
  const request = new sql.Request();
  request.query(
    `select top 100 * from ITM_MST where ITMNO='${itm}' and ECO_NO='${alc}'
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
router.post("/chkprdno", (req, res) => {
  const a = req.body.params;
  console.log(a);
  // const itm = a[0].trim();
  // const alc = a[1].trim();
  const request = new sql.Request();
  request.query(
    `select top 100 * from SAL_PART where PART_LABEL='${a}'
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

router.post("/insertproduct", (req, res) => {
  const { params } = req.body;
  console.log("insertproduct", params);
  const stagno = params[0];
  const partlabel = params[1];
  const tagpart = params[2];
  const labelpart = params[3];
  const dttm = params[4];
  const request = new sql.Request();
  request.query(
    `insert into SAL_PART values('${stagno}','${partlabel}','${tagpart}','${labelpart}',${dttm})
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
