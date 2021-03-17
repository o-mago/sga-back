const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Sequelize.Model { }
	User.init({
		id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		privilege: DataTypes.INTEGER,
	}, { sequelize, modelName: 'users', timestamps: false });
	return User;
}