const express = require("express");


const router = express.Router();

// dashboard
router.get("/", (req, res) => {
  res.render("dashboard");
});


module.exports = router;


// for the carousel 
$('.carousel').carousel()