'use strict'

const db = require("../models");
const Issue = db.sequelize.import("../models/issue");
const Option = db.sequelize.import("../models/option");
const logger = require('../services/logger');


exports.get_options = function (req, res) {
  Promise.all([
    new Promise((resolve, reject) => resolve(get_component_name(req.body))),
    new Promise((resolve, reject) => resolve(get_last_update())),
    new Promise((resolve, reject) => resolve(get_site(req.body))),
    new Promise((resolve, reject) => resolve(get_group(req.body))),
    new Promise((resolve, reject) => resolve(get_year())),
  ]).then(result => {
    let options = {
      audit: result[0],
      lastUpdate: result[1],
      admin: result[2],
      group: result[3],
      year: result[4],
    };
    console.log(result);
    res.json(options);
  }).catch(reason => {
    logger.warn("controller => get_options: " + reason);
    // console.warn('Failed!', reason);
  });
};

const get_component_name = (req) => {
  return Promise.all([
    new Promise((resolve, reject) => resolve(
      Option.findAll({
      raw: true,
      attributes: ['option'],
      where: {
        type: 'org'
      }
    }).then(site => { 
      return get_value(site, 'option');
    }).catch(err => logger.warn("controller => get_component_name: "+err))
  )),
    Issue.findAll({
      raw: true,
      attributes: ['componentName'],
      group: ['componentName'],
      where: {
        [db.Sequelize.Op.and]: [
          {
            componentName: {
              [db.Sequelize.Op.ne]: null
          }
        },
          db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), req.year),
        ]
      }
    }).then(site => {
      return get_value(site, 'componentName');
    }).catch(err => logger.warn("controller => get_component_name: "+err))
  ]).then(result => {
    console.log("RESPONSE", result);
    let response = result[0].reduce((acc,elem) => {
      let dict = {}  
      dict["name"] = elem;
      if(result[1].map(item => item.toUpperCase()).includes(elem)) {
        dict["enabled"] = true;
      } else {
        dict["enabled"] = false;
      }
      acc.push(dict);
      return acc;
    }, []);
    return response;
  }).catch(reason => {
    logger.warn("controller => get_component_name: "+reason)
  });
}

const get_year = () => {
  return Issue.findAll({
    raw: true,
    attributes: [[db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), 'year']],
    group: [[db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), 'year']]
  }).then(year => {
    return get_value(year, 'year');
  }).catch(err => logger.warn("controller => get_year: "+err));
}

const get_last_update = () => {
  return Issue.findOne({
    raw: true,
    attributes: [[db.Sequelize.fn('MAX', db.sequelize.col('lastUpdate')), 'lastUpdate']]
  }).then(lastUpdate => {
    return lastUpdate['lastUpdate'].toLocaleDateString('pt-BR', {timeZone: 'UTC'});
  }).catch(err => logger.warn("controller => get_last_update: "+err));

}

const get_group = (req) => {
  return Promise.all([
    new Promise((resolve, reject) => resolve(
      Option.findAll({
      raw: true,
      attributes: ['option'],
      where: {
        type: 'group'
      }
    }).then(site => { 
      return get_value(site, 'option');
    }).catch(err => logger.warn("controller => get_group: "+err))
  )),
    Issue.findAll({
      raw: true,
      attributes: ['group'],
      group: ['group'],
      where: {
        [db.Sequelize.Op.and]: [
          {
            group: {
              [db.Sequelize.Op.ne]: null
          }
        },
          db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), req.year),
        ]
      }
    }).then(site => {
      return get_value(site, 'group');
    }).catch(err => logger.warn("controller => get_group: "+err))
  ]).then(result => {
    let response = result[0].reduce((acc,elem) => {
      let dict = {}  
      dict["name"] = elem;
      if(result[1].map(item => item.toUpperCase()).includes(elem)) {
        dict["enabled"] = true;
      } else {
        dict["enabled"] = false;
      }
      acc.push(dict);
      return acc;
    }, []);
    return response;
  }).catch(reason => {
    logger.warn("controller => get_group: "+reason)
  });
}

const get_site = (req) => {
  return Promise.all([
    new Promise((resolve, reject) => resolve(
      Option.findAll({
      raw: true,
      attributes: ['option'],
      where: {
        type: 'site'
      }
    }).then(site => { 
      return get_value(site, 'option');
    }).catch(err => logger.warn("controller => get_site: "+err))
  )),
    Issue.findAll({
      raw: true,
      attributes: ['site'],
      group: ['site'],
      where: {
        [db.Sequelize.Op.and]: [
          {
            site: {
              [db.Sequelize.Op.ne]: null
          }
        },
          db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('dueDate')), req.year),
        ]
      }
    }).then(site => {
      return get_value(site, 'site');
    }).catch(err => console.log(err))
  ]).then(result => {
    console.log("RESPONSE", result);
    let response = result[0].map(item => item.toUpperCase()).reduce((acc,elem) => {
      let dict = {}  
      dict["name"] = elem;
      if(result[1].includes(elem)) {
        dict["enabled"] = true;
      } else {
        dict["enabled"] = false;
      }
      acc.push(dict);
      return acc;
    }, []);
    return response;
  }).catch(reason => {
    logger.warn("controller => get_site: "+reason);
  });
  
}

const get_value = (object, key) => {
  return object.map((value) => {
    return value[key];
  });
}