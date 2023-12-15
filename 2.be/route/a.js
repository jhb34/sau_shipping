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

router.post("/add", (req, res) => {
  const po = req.body.param;
  const request = new sql.Request();
  request.query(
    `insert into TB_PO_INFO (PART_NO,CUST_CODE,CUST_PART,PO_NO,LINE_NO,CUST_NAME,SHIP_TO_PLANT,UOM,SUPPLIER_NAME,SUPPLIER_CODE,DOCK_NO,PART_DESC) values('${po.PART_NO}','${po.CUST_CODE}','${po.CUST_PART}','${po.PO_NO}','${po.LINE_NO}','${po.CUST_NAME}','${po.SHIP_TO_PLANT}','${po.UOM}','${po.SUPPLIER_NAME}','${po.SUPPLIER_CODE}','${po.DOCK_NO}','${po.PART_DESC}')`,
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

router.post("/getpos", (req, res) => {
  const { param } = req.body;
  const request = new sql.Request();
  request.query(
    `select * from TB_PO_INFO where cust_code='${param}' order by part_no`,
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
