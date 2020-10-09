const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    username: {
    	type: DataTypes.STRING,
    	unique: true
    }
  });
};
