'use strict'

const logger = require('../services/logger');

exports.doc = function (req, res) {
  try {
    res.sendFile('doc.html', { root: "./" });
  } catch (error) {
    logger.warn("controller => doc: " + error);
  }
};