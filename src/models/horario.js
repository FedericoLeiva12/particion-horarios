const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Horario = sequelize.define('horario', {
    start: {
      type: DataTypes.INTEGER
    },
    end: {
      type: DataTypes.INTEGER
    },
    used: {
      type: DataTypes.BOOLEAN
    }
  });
};
