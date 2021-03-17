const db = require("../models");
const Issue = db.sequelize.import("../models/issue");
const Sites = db.sequelize.import("../models/sites");
const AuditOrg = db.sequelize.import("../models/audit_org");
const axios = require("axios");
const logger = require('./logger');
const fields = require('./fields.json');

exports.update = function (req, res) {
  let year = req.params ? req.params.year : new Date().getFullYear();
  new Promise((resolve, reject) => resolve(update_impl(year)))
  .then((result) => {
    logger.info(req.params.year+" updated");
    res.json("OK")
  });
};

const update_impl = (year) => {
  // console.log("UPDATE");
  
  const jql = "project=RAC" +
    " AND (dueDate >= " + year + "-01-01 AND duedate <= " + year + "-12-31)"
    ;

  return new Promise((resolve, reject) => resolve(request_jira(Start_at = 0, Max_results = 0, JQL = jql, Fields = fields)))
    .then((result) => {

      console.log(result.total);
      const n_issues = 100.0;
      const n_calls = Math.ceil(result.total / n_issues);
      let calls_array = [];

      for (i = 0; i < n_calls; i++) {
        calls_array.push(request_jira(Start_at = n_issues * i, Max_results = 100, JQL = jql, Fields = fields))
      }

      Promise.all(calls_array)
        .then((result) => {
          // console.log("final: ", result);
          date_before = new Date();
          Promise.all([
            new Promise((resolve, reject) => resolve(get_sites())),
            new Promise((resolve, reject) => resolve(get_audit()))
          ])
          .then((relations) => {
              parse_result(result, relations[0], relations[1]);
              delete_outdated(date_before, year);
          })
          .catch(err => {

          });

        })
        .catch(reason => {
          logger.warn("update_service => update_impl: "+reason);
          // console.warn('Failed!', reason);
        });

    })
    .catch(reason => {
      logger.warn("update_service => update_impl: "+reason);
      // console.warn('Failed!', reason);
    });
}

const request_jira = (Start_at = 0, Max_results = 0, JQL = "", Fields = []) => {
  return axios.post(process.env.JIRA_URL + "/search", {
    startAt: Start_at,
    jql: JQL,
    maxResults: Max_results,
    fields: Fields
  }, {
      headers: {
        Accept: 'application/json'
      },
      auth: {
        username: process.env.JIRA_USER,
        password: process.env.JIRA_PASSWORD
      }
    })
    .then(function (response) {
      // console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      logger.warn("update_service => request_jira: "+error);
      // console.log(error);
    });
}

const parse_result = (result, site_relation, audit_relation) => {
      let parsed = [];
      //Iterating through calls
      result.forEach(element => {
      //Iterating through issues
      element.issues.forEach(val => {
        let issue = {};
        issue["issueKey"] = val[fields.key];
        issue["summary"] = val.fields[fields.summary];
        issue["status"] = val.fields[fields.status] ? val.fields[fields.status].name : "";
        issue["dueDate"] = val.fields[fields.dueDate];
        issue["assignee"] = val.fields[fields.assignee] ? val.fields[fields.assignee].name : "";
        issue["type"] = val.fields[fields.type] ? val.fields[fields.type].name : "";
        issue["site"] = val.fields[fields.site] ? 
        site_relation[val.fields[fields.site][0].value.toUpperCase()] ? site_relation[val.fields[fields.site][0].value.toUpperCase()] : null
        : null;
        issue["componentName"] = val.fields[fields.componentName] ? 
        audit_relation[val.fields[fields.componentName].value.toUpperCase()] ? audit_relation[val.fields[fields.componentName].value.toUpperCase()] : null
        : null;
        issue["group"] = val.fields[fields.group] ? val.fields[fields.group].value.toUpperCase() : null;
        issue["incorrectDueDate"] = new Date() > new Date(val.fields[fields.dueDate]) ? 1 : 0;
        issue["issueSprint"] = "";
        issue["lastUpdate"] = new Date();
        update_db(issue);
        parsed.push(issue);
      });
    });
    return parsed;
}

const update_db = (issue) => {
  return Issue.upsert(
    issue
  ).then(result => {
    // console.log(result);
    return "OK";
  }).catch(err => logger.warn("update_service => update_db: "+err));
}

const delete_outdated = (date_before, year) => {
    return Issue.destroy( {
        where: { 
          [db.Sequelize.Op.and]: [
            {
              lastUpdate: {
                [db.Sequelize.Op.lt]: date_before
              }
            },
            {
              dueDate:{
                [db.Sequelize.Op.lte]:  year + "-12-31"
              }
            },
            {
              dueDate:{
                [db.Sequelize.Op.gte]: year + "-01-01"
              }
            }
          ]
        }
      }).then(result => {
        // console.log(result);
        return "OK";
      }).catch(err => logger.warn("update_service => delete_outdated: "+err));
}

const get_sites = () => {
  return Sites.findAll({
    raw: true,
  }).then(result => {
    //console.log(result);
    let site_result = {}
    result.forEach(elem => {
      site_result[elem.site_name] = elem.site_label;
    });
    return site_result;
  }).catch(err => logger.warn("update_service => get_sites: " + err));
}

const get_audit = () => {
  return AuditOrg.findAll({
    raw: true,
  }).then(result => {
    //console.log(result);
    let audit_result = {}
    result.forEach(elem => {
      audit_result[elem.audit_name] = elem.audit_label;
    });
    return audit_result;
  }).catch(err => logger.warn("update_service => get_audit: " + err));
}

exports.update_impl = update_impl;