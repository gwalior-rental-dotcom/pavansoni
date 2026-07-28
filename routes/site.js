const express = require('express');
const router = express.Router();
const { getSite } = require('../utils/siteStore');

router.get('/', (req, res) => {
  const site = getSite();
  res.render('site/index', { site });
});

module.exports = router;
