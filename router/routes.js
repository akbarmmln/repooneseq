'use strict';

module.exports = function(app) {
    var todoList = require('../controller/controller');
    var todoListAPI = require('../controller/controllerAPI');

    app.route('/')
        .get(todoList.index);

    app.route('/app')
        .get(todoList.index);

    app.route('/home')
        .get(todoList.index);

    app.route('/app/home')
        .get(todoList.home);

    app.route('/app/login')
        .get(todoList.login);

    app.route('/app/splogin')
        .post(todoList.splogin);

    app.route('/app/proseslogin')
        .post(todoList.plogin);

    app.route('/app/daftar')
        .get(todoList.daftar);

    app.route('/app/prosesdaftar')
        .post(todoList.pdaftar);

    app.route('/app/mail/:lv')
        .get(todoList.mail);

    app.route('/app/logout')
        .get(todoList.logout);

    app.route('/app/verifikasi-ulang')
        .post(todoList.vu);

    app.route('/app/pesanan')
        .get(todoList.pesanan);

    app.route('/app/pencarian')
        .post(todoList.pencarian);

    app.route('/app/booking')
        .post(todoList.booking);

    app.route('/app/prosesbooking')
        .post(todoList.prosesbooking);

    app.route('/app/pembayaran/:lk')
        .get(todoList.conpembayaran);

    app.route('/app/cancelbooking/:idbook')
        .get(todoList.cancelbooking);
};