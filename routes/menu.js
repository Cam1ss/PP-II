var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render("inicial/menu", { title: "Menu" });
});

module.exports = router;