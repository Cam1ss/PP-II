var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render("Topicos/topico02", { title: "Topico 02" });
});

module.exports = router;