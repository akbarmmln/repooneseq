'use strict';

const sequelize = require('sequelize');
const dbConnection = require('../koneksi/koneksi').Sequelize;
const Sequelize = require('../koneksi/koneksi').Sequelize;

exports.returnErrorFunction = function(resObject, errorMessageLogger, errorObject){
    resObject.write('<html><head></head><body>');
    resObject.write('<script>window.location.href="javascript:history.back(-1)"</script>');
    resObject.end('</body></html>');
    return;
};

exports.inchild1 = async function (transaction){
    try
    {
        let inchild1 = await dbConnection.query("INSERT INTO child1 (string) VALUES (:str_)",
        { replacements: { str_:'6' }, type: sequelize.QueryTypes.INSERT, transaction: transaction },
        {
            raw: true
        });
    }
    catch(e){
        console.log(e);
        throw 'err';
    }
};

exports.inchild2 = async function (transaction){
    try
    {
        let inchild1 = await dbConnection.query("INSERT INTO child2 (string) VALUES (:str_)",
        { replacements: { str_:'6' }, type: sequelize.QueryTypes.INSERT, transaction: transaction },
        {
            raw: true
        });
    }
    catch(e){
        console.log(e);
        throw 'err';
    }
};