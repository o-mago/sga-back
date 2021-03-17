const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Sequelize.Model { }
  Option.init({
    option: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    type: DataTypes.STRING
  }, { sequelize, modelName: 'options', timestamps: false });
  return Option;
}