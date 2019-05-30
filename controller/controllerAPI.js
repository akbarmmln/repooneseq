// 'use strict';

// const sequelize = require('sequelize');
// const dbConnection = require('../koneksi/koneksi').Sequelize;
// const response = require('../res/res');
// const sha1 = require('sha1');
// var moment = require('moment');
// const request = require('request');
// const cron = require("node-cron");
// const xml2js = require('xml2js');

// //cek ketersediaan bayar ckb/ukb -> setiap detik
// cron.schedule("*/1 * * * * *", async function() {
//     try
//     {
//         var mallid = "11408317";
//         var sharedkey = "pZ8nb8joZpJh";
//         var chainmerchant = "NA";
//         var headersOpt = {  
//             "content-type": "application/json",
//         };

//         var data1 = await dbConnection.query("SELECT id_booking FROM booking WHERE status_pembayaran = :stat_pem",
//         { replacements: { stat_pem:'Pending' }, type: sequelize.QueryTypes.SELECT },
//         {
//             raw: true
//         });

//         if(data1.length > 0)
//         {
//             for(var i=0; i<data1.length; i++)
//             {
//                 var idbook = data1[i]['id_booking'];
//                 var transidmerchant = idbook;
//                 var sessid = idbook;
//                 var words = mallid+sharedkey+transidmerchant;
//                 var words_ = sha1(words);

//                 request.post('https://staging.doku.com/Suite/CheckStatus',
//                 {
//                     form: {MALLID:mallid, CHAINMERCHANT:chainmerchant, TRANSIDMERCHANT:transidmerchant, SESSIONID:sessid, WORDS:words_},
//                     headers: headersOpt,
//                     json: true
//                 },(error, res, hasil) => {
//                     if(error)
//                     {
//                         console.log(error)
//                     }
//                     else
//                     {
//                         var parser = new xml2js.Parser();
//                         parser.parseString(hasil, async function (err, result) {
//                             var tar = result['PAYMENT_STATUS']['TRANSIDMERCHANT'];
//                             var ss = result['PAYMENT_STATUS']['SESSIONID'];
//                             var pcy = result['PAYMENT_STATUS']['PAYMENTCHANNEL'];
//                             var pc = result['PAYMENT_STATUS']['PAYMENTCODE'];
//                             var stat = result['PAYMENT_STATUS']['RESULTMSG'];

//                             if(stat != "TRANSACTION_NOT_FOUND")
//                             {
//                                 var update = await dbConnection.query("UPDATE booking SET invoice_number = :invnum_, session_id = :sessid_, payment_channel = :pcy_, payment_code = :pco_, status_pembayaran = 'ON' "+
//                                 "WHERE id_booking = :idbook_",
//                                 { replacements: {invnum_:tar, sessid_:ss, pcy_:pcy, pco_:pc, idbook_:idbook}, type: sequelize.QueryTypes.UPDATE },
//                                 {
//                                     raw: true
//                                 });
//                             }
//                         });
//                     }
//                 })
//             }
//         }
//     }
//     catch(e)
//     {
//         console.log(e);
//     }
// });

// //cek status pending dan on
// cron.schedule("*/1 * * * * *", async function() {

//     try
//     {
//         var data1 = await dbConnection.query("SELECT id_booking, ws FROM booking WHERE status_pembayaran = 'Pending' OR status_pembayaran = 'ON'",
//         { type: sequelize.QueryTypes.SELECT },
//         {
//             raw: true
//         });
    
//         if(data1.length > 0)
//         {
//             for(var i=0; i<data1.length; i++)
//             {
//                 var now = moment().format("DD/MM/YYYY HH:mm:ss");
//                 var wsa = moment.utc(data1[i]['ws']).format('DD/MM/YYYY HH:mm:ss');
//                 var ms = moment(wsa,"DD/MM/YYYY HH:mm:ss").diff(moment(now,"DD/MM/YYYY HH:mm:ss"));
//                 var d = moment.duration(ms);
//                 var menito = Math.floor(d.asHours());

//                 if(menito < 0)
//                 {
//                     await dbConnection.query("UPDATE booking SET status_pembayaran = 'Expired' WHERE id_booking = :idbook_",
//                     { replacements: {idbook_:data1[i]['id_booking']}, type: sequelize.QueryTypes.UPDATE },
//                     {
//                         raw: true
//                     });
//                 }
//             }
//         }
//     }
//     catch(e)
//     {
//         console.log(e);
//     }
// });