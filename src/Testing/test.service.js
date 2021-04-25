const express = require("express");
const router = express.Router();
const userFunctions = require("../functions/user.functions");
const cache = require("../cache/nodeCache");



module.exports = router;

router.get("/", async (req, res) => {
  const obj = {
    firstName: "zied",
    lastName: "dams"
  }
  suggetUserame = await userFunctions.getSuggestUsername(obj)
  console.log(suggetUserame)
  cache.ovivCache.set("username",["zieddams"]);
  console.log(cache.ovivCache.existUsername("zieddams"))
  console.log(cache.ovivCache.existUsername("zieddams1"))
  res.send(suggetUserame)
})
