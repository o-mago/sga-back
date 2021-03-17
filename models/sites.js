const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Sites extends Sequelize.Model { }
	Sites.init({
		"site_name": {
			primaryKey: true,
			type: DataTypes.STRING
		},
		"site_label": DataTypes.STRING,
	}, { sequelize, modelName: 'sites', timestamps: false, freezeTableName: true });
	return Sites;
}