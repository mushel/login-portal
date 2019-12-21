const express = require("express");


const router = express.Router();

// Seekers page
router.get("/", (req, res) => {
  res.render("seeker");
});

module.exports = router;