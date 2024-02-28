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

router.post("/getlist", (req, res) => {
  const { params } = req.body;
  const date = params[0].trim();
  const trailer = params[1].trim();
  const cust = params[2].trim();
  const request = new sql.Request();
  request.query(
    `select TOP 100 * from SAL_ORDER where SAL_YMD=${date} and TRAILER_NO='${trailer}' and CUST_CD='${cust}' order by SCAN_HM desc,ITMNO
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

router.post("/chkdup", (req, res) => {
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

router.post("/chkpo", (req, res) => {
  const a = req.body.params;
  console.log(a);
  // const date = params[0].trim();
  // const cust = params[1].trim();
  const request = new sql.Request();
  request.query(
    `select top 100 * from  TB_PO_INFO where PART_NO='${a.ITMNO}' and CUST_CODE='${a.CUST_CD}'
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

router.post("/chkitmno", (req, res) => {
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
router.post("/isshaft", (req, res) => {
  const a = req.body.params;
  console.log(a);
  const scan = a[0];
  const code = a[1];
  console.log(scan.TMP_ITMNO);
  console.log(code);
  const request = new sql.Request();
  request.query(
    `select top 100 * from ITM_MST where ITMNO='${scan.TMP_ITMNO}' and GUB_CD='${code}'
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

router.post("/updatecontainer", (req, res) => {
  const { params } = req.body;
  console.log(params);
  const con = params[0];
  const selectd = params[1];
  // const scanbox = params[2];
  // const today3 = params[3];
  // const code = params[4];
  // const request = new sql.Request();
  // request.query(
  //   `update SAL_ORDER set CONTAINER_NO='${con}',NOW_ST='3' where SAL_YMD='${selectd.date}' and TRAILER_NO='${selectd.trail}'  `,
  //   (err, result) => {
  //     if (err) {
  //       console.log(err);
  //       res.sendStatus(500);
  //       return;
  //     }
  //     console.log(result);
  //     res.send(result);
  //   }
  // );
});

module.exports = router;
