var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("inicial/aboutUs", { title: "Sobre nós" });
});

module.exports = router;
