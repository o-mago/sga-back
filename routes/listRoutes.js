'use strict';
module.exports = function(app) {
  var options_controller = require('../controllers/options_controller');
  var doc_controller = require('../controllers/doc_controller');
  var drilldown_controller = require('../controllers/drilldown_controller');
  var table_controller = require('../controllers/table_controller');
  var sga_update = require('../services/update_service');
  var sga_login = require('../services/login');

  app.route('/rest/api/options')
  .post(options_controller.get_options);

  app.route('/rest/api/results')
  .post(table_controller.get_table_result);

  app.route('/rest/api/drilldown')
  .post(drilldown_controller.get_drilldown);

  app.route('/rest/api/update/:year')
  .put(sga_update.update);

  app.route('/rest/api/doc')
  .get(doc_controller.doc);

  app.route('/rest/api/login')
  .post(sga_login.login);
};