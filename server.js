require('dotenv/config');

var express = require('express'),
  app = express(),
  port = process.env.PORT || 8092,
  bodyParser = require('body-parser'),
  schedule = require('node-schedule'),
  cors = require('cors'),
  sga_update = require('./services/update_service');

console.log(process.env.FRONT_URL);

var corsOptions = {
  origin: process.env.FRONT_URL,
  optionsSuccessStatus: 200
}

const cron_options = process.env.CRON_SCHEDULE;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
// app.use(login.passport.initialize());

var routes = require('./routes/listRoutes');
routes(app);

var job = schedule.scheduleJob(cron_options, () => {
  console.log("O TREM RODOU!");
  sga_update.update_impl(new Date().getFullYear());
});

// models.sequelize.sync().then(() => {
app.listen(port, () => console.log('SGA RESTful API server started on: ' + port));
// });

module.exports = app;