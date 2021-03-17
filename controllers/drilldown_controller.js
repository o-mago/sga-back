'use strict'

const db = require("../models");
const Issue = db.sequelize.import("../models/issue");
const logger = require('../services/logger');


//Mandar incorrectDueDate: 1 para puxar drilldown do erro
exports.get_drilldown = function (req, res) {
  new Promise((resolve, reject) => resolve(get_drilldown(req.body)))
    .then((result) => res.json(result)).catch(reason => {
      logger.warn("controller => get_drilldown: " + reason);
    });
};

const get_drilldown = (req) => {
  let whereObj = {};
  for(var key in req) {whereObj[key] = req[key];};
  delete whereObj.month;
  delete whereObj.year;
  let whereAnd = [];
  whereAnd.push(whereObj);
  whereAnd.push(db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), req.year))
  if (!req.hasOwnProperty("incorrectDueDate") && req.month) {
    whereAnd.push(db.sequelize.where(db.sequelize.fn('MONTH', db.sequelize.col('dueDate')), req.month))
  }
  return Issue.findAll({
    raw: true,
    attributes: [['issueKey', 'key'],
    ['assignee', 'assignee'],
    ['type', 'type'],
    ['summary', 'summary'],
    ['dueDate', 'date'],
    ['issueSprint', 'sprint'],
    ['status', 'status']
    ],
    where: {
      [db.Sequelize.Op.and]: whereAnd
    },
    order: [['dueDate', 'ASC']]
  }).then(result => {
    return result;
  }).catch(err => logger.warn("controller => get_drilldown: "+err));
}