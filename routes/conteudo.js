var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render("inicial/conteudo", { title: "Conteudo" });
});

module.exports = router;