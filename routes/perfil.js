var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("inicial/perfil", { title: "Perfil" });
});

module.exports = router;
