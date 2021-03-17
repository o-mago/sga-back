const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Issue extends Sequelize.Model { }
	Issue.init({
		issueKey: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		dueDate: DataTypes.DATE,
		lastUpdate: DataTypes.DATE,
		summary: DataTypes.STRING,
		type: DataTypes.STRING,
		componentName: DataTypes.STRING,
		jiraTeam: DataTypes.STRING,
		assignee: DataTypes.STRING,
		status: DataTypes.STRING,
		issueSprint: DataTypes.STRING,
		site: DataTypes.STRING,
		group: DataTypes.STRING,
		incorrectDueDate: DataTypes.INTEGER
	}, { sequelize, modelName: 'issues', timestamps: false });
	return Issue;
}