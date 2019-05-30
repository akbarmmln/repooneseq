const Sequelize = require('sequelize');
const dbConnection = require('../koneksi/koneksi').Sequelize;

const modproduct = dbConnection.define('product', {
  product_id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  id_person: Sequelize.STRING,
  product_name: Sequelize.STRING,
  product_price: Sequelize.BIGINT,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'product'
});

module.exports = modproduct;