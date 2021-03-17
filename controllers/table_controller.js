'use strict'

const db = require("../models");
const Issue = db.sequelize.import("../models/issue");
const logger = require('../services/logger');

exports.get_table_result = function (req, res) {
  Promise.all([
    new Promise((resolve, reject) => resolve(get_table_count(req.body))),
    new Promise((resolve, reject) => resolve(get_error_count(req.body)))
  ]).then(result => {
    for (var key in result[1]) { result[0][key] = result[1][key]; }
    let response = result[0];
    console.log("response", response);
    res.json(response);
  }).catch(reason => {
    logger.warn("controller => get_table_result: " + reason);
  });
};

const get_table_count = (req) => {
  let whereObj = {};
  for(var key in req) {whereObj[key] = req[key];};
  
  delete whereObj.year;
  delete whereObj.month;
  return Issue.findAll({
    raw: true,
    attributes: ['status',
      [db.sequelize.fn('MONTH', db.sequelize.col('dueDate')), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('issueKey')), 'number']
    ],
    group: ['status',
      db.sequelize.fn('MONTH', db.sequelize.col('dueDate'))
    ],
    order: ['status',
      db.sequelize.fn('MONTH', db.sequelize.col('dueDate'))
    ],
    where: {
      [db.Sequelize.Op.and]: [
        db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), req.year),
        { status: ["Open", "In Progress", "Done", "Canceled"] },
        whereObj
      ]
    }
  }).then(result => {
    let jsonResult = result.reduce((acc, curr) => {
      if (!acc[curr.status]) {
        acc[curr.status] = new Array(13).fill(0);
      }
      acc[curr.status][curr.month - 1] = curr.number;
      acc[curr.status][12] += curr.number;
      acc['Planned'][curr.month - 1] += curr.number;
      acc['Planned'][12] += curr.number;
      acc['Delivered'][curr.month - 1] += curr.number;
      acc['Delivered'][12] += curr.number;
      return acc;
    }, { 'Open': new Array(13).fill(0), 'In Progress': new Array(13).fill(0), 'Done': new Array(13).fill(0), 'Canceled': new Array(13).fill(0),
    'Planned': new Array(13).fill(0), 'Delivered': new Array(13).fill(0) });
    jsonResult['Delivered'] = jsonResult['Delivered'].map((item, index) => {
      return (item != 0) ? Math.round(( (jsonResult['Done'][index]/item) * 100) / 100) : 100;
    });
    return jsonResult;
  }).catch(err => logger.warn("controller => get_table_count: "+err));
}

const get_error_count = (req) => {
  let whereObj = {};
  for(var key in req) {whereObj[key] = req[key];};
  
  delete whereObj.year;
  delete whereObj.month;

  return Issue.findOne({
    raw: true,
    attributes: [[db.sequelize.fn('SUM', db.sequelize.col('incorrectDueDate')), 'error']],
    where: {
      [db.Sequelize.Op.and]: [
        db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), req.year),
        { status: ["Open", "In Progress", "Done", "Canceled"] },
        whereObj
    ]
  }
  }).then(result => {
    return result;
  }).catch(err => logger.warn("controller => get_error_count: "+err));
};
