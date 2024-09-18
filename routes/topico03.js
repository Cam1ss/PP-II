var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render("Topicos/topico03", { title: "Topico 03" });
});

module.exports = router;