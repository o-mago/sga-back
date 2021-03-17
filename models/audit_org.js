const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class AuditOrg extends Sequelize.Model { }
	AuditOrg.init({
		"audit_name": {
			primaryKey: true,
			type: DataTypes.STRING
		},
		"audit_label": DataTypes.STRING,
	}, { sequelize, modelName: 'audit_org', timestamps: false, freezeTableName: true });
	return AuditOrg;
}