## SGA - Schedule Global Audit (REST Api)

### Preparing the environment:

1- Clone the repository: `$ git clone https://github.com/o-mago/sga-back.git`

2- Install the dependencies (go to the root folder): `$ npm install`

3- Create a file called `config.json` inside the root folder with the following structure:

```json
{
  "development": {
    "username": "<db_username>",
    "password": "<db_password>",
    "database": "<db_database>",
    "host": "<db_host>",
    "port": "<db_port>",
    "dialect": "mysql"
  },
  "production": {
    "username": "<db_username>",
    "password": "<db_password>",
    "database": "<db_database>",
    "host": "<db_host>",
    "port": "<db_port>",
    "dialect": "mysql"
  }
}
```

4- Create a `.env` file inside the root folder with the following structure:

```.env
JIRA_URL=https://jiraexample.com
JIRA_USER=jira_user
JIRA_PASSWORD=jira_password
FRONT_URL=http://frontend_url.com
CRON_SCHEDULE=* * 3 */1 * *
LDAP_URL=ldap://url
LDAP_BIN_DN=rules
LDAP_SEARCH_BASE=dc={company},dc=prd
LDAP_SEARCH_FILTER=dc={company},dc=prd
```
Change the values above for the correct ones

The CRON_SCHEDULE variable uses the [cron syntax](https://www.npmjs.com/package/node-cron#cron-syntax)
It sets the schedule to run the SGA data update for the current year
The example above is set to run the update task every day at 3:00

### Running:

`$ npm run start`

### Deploying on pm2:

If you're not familiarized with pm2: http://pm2.keymetrics.io/

#### Starting the app
Go to the root folder on the terminal and then run:
`$ pm2 start server.js --name sga`

#### Stopping the app
`$ pm2 stop sga`

#### Restarting the app
`$ pm2 restart sga`

#### Deleting the app from pm2
`$ pm2 delete sga`

#### Opening the documentation
Open the `doc.html` file on a browser

#### Generating a new documentation
1- Make the changes in the `api_doc.apib` file
2- Run `generate_doc.bat` script

### Built With

* [Visual Studio Code](https://code.visualstudio.com/)
* [Node.js](https://nodejs.org/en/)
* [API Blueprint](https://apiblueprint.org/)
* [Aglio](https://github.com/danielgtaylor/aglio)

### Git Workflow
* [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/)

### Frontend:
https://github.com/o-mago/sga-front.git

### Author

Alexandre Cabral Bedeschi - alexandre.cabral@engenharia.ufjf.br