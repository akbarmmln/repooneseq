const moment = require('moment');

function rs(data) {
  return {
    message: 'success',
    data: data,
    language: 'EN',
    time: moment().format('YYYY-MM-DD HH:mm:ss')
  }
}

module.exports = rs;