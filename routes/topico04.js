var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render("Topicos/topico04", { title: "Topico 04" });
});

module.exports = router;