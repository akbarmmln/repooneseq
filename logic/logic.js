'user strict';

var sql = require('../koneksi/conn');
var moment = require('moment');
var Task = function(task){};

Task.create_random = function(length)
{
    var result = "";
    var data = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var charactersLength = data.length;
    for ( var i = 0; i < length; i++ ) {
        result += data.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

Task.create_random_number = function(length)
{
    var result = "";
    var data = '0123456789';
    var charactersLength = data.length;
    for ( var i = 0; i < length; i++ ) {
        result += data.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = Task;