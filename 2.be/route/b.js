const express = require("express");
const router = express.Router();
const mongoDB = require("../mongodb");

router.get("/assets", async (req, res) => {
  const lists = await mongoDB.find("asset2");
  res.send(lists);
});

module.exports = router;
