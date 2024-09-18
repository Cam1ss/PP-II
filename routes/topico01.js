var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render("Topicos/topico01", { title: "Topico 01" });
});

module.exports = router;