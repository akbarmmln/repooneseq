const Sequelize = require('sequelize');
const dbConnection = require('../koneksi/koneksi').Sequelize;

const modperson = dbConnection.define('person', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'person'
});

module.exports = modperson;