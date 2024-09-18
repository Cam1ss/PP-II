var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("Topicos/topico05", { title: "Topico 05" });
});

module.exports = router;
