const express = require("express");


const router = express.Router();

// dashboard
router.get("/", (req, res) => {
  res.render("dashboard");
});


module.exports = router;


