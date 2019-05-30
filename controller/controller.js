'use strict';

const sequelize = require('sequelize');
const dbConnection = require('../koneksi/koneksi').Sequelize;
const Sequelize = require('../koneksi/koneksi').Sequelize;

var sha1 = require('sha1');
var response = require('../res/res');
var urls = require('url');
var notifier = require('node-notifier');
var moment = require('moment');
var datetime = require('node-datetime');
var nodemailer = require('nodemailer');
var Task = require('../model/logic');
var uuidv4 = require('uuid/v4');
var utils = require('../utils/utils');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    type: "SMTP",
    host: "smtp.gmail.com",
    secure: true,
    auth: {
        user: 'akbarmmln@gmail.com',
        pass: 'akbarakbar'
    }
});

exports.index = async function(req, res) {
    res.redirect('/app/home');
};

exports.home = async function(req, res) {
    var sesslog = req.session._statlog;
    res.cookie("waktuisi", -1, {expire:120});
    res.render('home',{judul:"home", moment:moment, statlogin:sesslog});
};

exports.splogin = async function(req, res)
{
    try
    {
        var idjad = req.body.pilidjad;
        if(idjad == '' || idjad == null || !idjad)
        {
            throw 'err';
        }
    
        var tglb = moment(req.body.piltglb).format('YYYY-MM-DD');
        if(tglb == '' || tglb == null || !tglb)
        {
            throw 'err';
        }
    
        var tgls = moment(req.body.piltgls).format('YYYY-MM-DD');
        if(tgls == '' || tgls == null || !tgls)
        {
            throw 'err';
        }

        var jml = req.body.piljml;
        if(jml == '' || jml == null || !jml)
        {
            throw 'err';
        }
    
        var em = req.body.email;
        if(em == '' || em == null || !em)
        {
            throw 'err';
        }
    
        var pass = req.body.password;
        if(pass == '' || pass == null || !pass)
        {
            throw 'err';
        }

        var login = await dbConnection.query("SELECT customer.id_customer, customer.nama, login.email, login.password, login.status " +
        "FROM customer join login ON customer.id_customer = login.id_customer WHERE login.email = :em_",
        { replacements: { em_:em }, type: sequelize.QueryTypes.SELECT },
        {
            raw: true
        });

        if(login.length > 0)
        {
            if(em == login[0]['email'] && pass == login[0]['password'])
            {
                req.session._userid = login[0]['id_customer'];
                req.session._statlog = "true";
                res.write('<html><head></head><body>');
                res.write('<form name=myform id=myform action=/app/booking method=POST>');
                res.write('<input type=hidden name=idjdwal value='+idjad+' />');
                res.write('<input type=hidden name=jumlahpenumpang value='+jml+' />');
                res.write('<input type=hidden name=tanggalberangkat value='+tglb+' />');
                res.write('<input type=hidden name=tanggalsampai value='+tgls+' />');
                res.write('<input type=submit name=submits id=submits value=submit />');
                res.write('</form>');
                res.write('<script type=text/javascript>');
                res.write('window.onload = function () {document.getElementById("submits").style.display="none";document.myform.submits.click()}');
                res.write('</script>');
                res.end('</body></html>');
            }
            else
            {
                delete req.session._email;
                res.write('<html><head></head><body>');
                res.write('<script>window.location.href="javascript:history.back(-1)"</script>');
                res.end('</body></html>');
                notifier.notify({'title': 'Notifikasi', 'message' : 'Email dan password salah'});
            }
        }
        else
        {
            res.write('<html><head></head><body>');
            res.write('<script>window.location.href="javascript:history.back(-1)"</script>');
            res.end('</body></html>');
            notifier.notify({'title': 'Notifikasi', 'message' : 'Email dan password salah'});
        }
    }
    catch(e)
    {
        console.log(e);
        notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        utils.returnErrorFunction(res, 'Error', e);
    }
};

exports.login = async function(req, res) {
    var sesslog = req.session._statlog;
    if(!sesslog)
    {
        res.render('login',{judul:"login",statlogin:sesslog});
    }
    else
    {
        res.redirect('/app/home');
    }
};

exports.logout = async function(req, res) {
    req.session._statlog = "";
    res.redirect('/app/login');
};

exports.plogin = async function(req, res) {
    try
    {
        var email = req.body.email;
        var password = req.body.password;

        if(email == '' || email == null || !email)
        {
            throw 'err';
        }

        if(password == '' || password == null || !password)
        {
            throw 'err';
        }
        
        var datalogin = await dbConnection.query("SELECT customer.id_customer, customer.nama, login.email, login.password, login.status "+
        "FROM customer join login ON customer.id_customer = login.id_customer WHERE login.email = :em_",
        { replacements: { em_:email }, type: sequelize.QueryTypes.SELECT },
        {
            raw: true
        })

        if(datalogin.length > 0)
        {
            if(email == datalogin[0]['email'] && password == datalogin[0]['password'])
            {
                req.session._userid = datalogin[0]['id_customer'];
                req.session._statlog = "true";
                notifier.notify({'title': 'Notifikasi', 'message' : 'Selamat Datang di Ojekpulo ' + datalogin[0]['nama']});
                res.redirect('/app/home');
            }
            else
            {
                delete req.session._email;
                notifier.notify({'title': 'Notifikasi', 'message' : 'Email dan password salah'});
                res.redirect('/app/login');
            }
        }
        else
        {
            notifier.notify({'title': 'Notifikasi', 'message' : 'Email dan password salah'});
            res.redirect('/app/login');
        }
    }
    catch(e)
    {
        console.log(e);
        notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        utils.returnErrorFunction(res, 'Error', e);
    }
};

exports.daftar = async function(req, res)
{
    var sesslog = req.session._statlog;
    if(sesslog == "true")
    {
        res.redirect('/app/home');
    }
    else
    {
        res.render('regis',{judul:"true",statlogin:sesslog,moment:moment});
    }
};

exports.mail = async function(req, res)
{
    var lv = req.params.lv;
    var cekLinkVer = await dbConnection.query("SELECT * FROM login WHERE link_verifikasi = :link_",
    { replacements:{link_:lv}, type: sequelize.QueryTypes.SELECT },
    {
        raw: true
    });

    if(cekLinkVer.length > 0)
    {
        var updateVer = await dbConnection.query("UPDATE login SET status = :stat_, kode_verifikasi = :kdv_, link_verifikasi = :lvk_ WHERE id_customer = :id_",
        { replacements:{stat_:'Aktif', kdv_: '-', lvk_: '-', id_: cekLinkVer[0]['id_customer']}, type: sequelize.QueryTypes.UPDATE },
        {
            raw: true
        });

        if(updateVer)
        {
            notifier.notify({'title': 'Notifikasi', 'message' : 'Akun Anda berhasil di aktifasi'});
        }
        else
        {
            notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        }
    }
    else
    {
        notifier.notify({'title': 'Notifikasi', 'message' : 'Link Verifikasi tidak ditemukan atau telah kadaluwarsa'});
    }
    res.redirect('/app/login');
};

exports.vu = async function(req, res) {
    try
    {
        var em = req.body.email;
        if(em == '' || em == null || !em)
        {
            throw 'err';
        }

        var cekResend = await dbConnection.query("SELECT customer.nama, login.* FROM customer JOIN login "+
        "ON customer.id_customer = login.id_customer WHERE login.email = :em_",
        { replacements:{em_: em}, type: sequelize.QueryTypes.SELECT },
        {
            raw: true
        });

        if(cekResend.length > 0)
        {
            var id = cekResend[0]['id_customer'];
            var nama = cekResend[0]['nama'];
            var usr = cekResend[0]['email'];
            var status = cekResend[0]['status'];
            if(status == "Belum Verifikasi")
            {
                var kv = Task.create_random(6);
                var lv = Task.create_random(30)+kv+Task.create_random(20)+id;
                var url = "http://"+req.get('host')+"/app/mail/"+lv;
                var bw = moment().add(12, 'hours').format('YYYY-MM-DD hh:mm');
                
                var resend = await dbConnection.query("UPDATE login SET kode_verifikasi = :kdv_, link_verifikasi = :lkv_, batas_waktu = :bw_ WHERE email = :em_",
                { replacements:{kdv_:kv, lkv_:lv, bw_:bw, em_:em}, type: sequelize.QueryTypes.UPDATE },
                {
                    raw: true
                });

                if(resend)
                {
                    var mailOptions = {
                        from: 'OjekPulo Team noreply@ojekpulo.com',
                        to: em,
                        subject: 'Resend Email Verification',
                        html : "<html><body style='margin: 10px;'><div style='width: 1000px; font-family: Helvetica, sans-serif; font-size: 13px; padding:10px; line-height:150%; border:#eaeaea solid 10px;'>"+ 
                        "<strong>Terima Kasih Telah Mendaftar</strong><br>"+
                        "<b>Nama Anda : </b>"+nama+"<br>"+
                        "<b>Username : </b>"+usr+"<br>"+
                        "<b>Kode Verifikasi : </b>"+kv+"<br>"+
                        "<b>URL Link Konfirmasi : </b> <a href='"+url+"'>Klik link ini</a><br>"+
                        "<b>Harap lakukan verifikasi dalam waktu 24 jam.</b><br><br>"+
                        "<img src='https://ojekpulo.000webhostapp.com/assetss/images/kapaltidung.jpg' width='1000' height='200' alt=''/>"+
                        "</div><body></html>"
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                            notifier.notify({'title': 'Notifikasi', 'message' : 'Server tidak menaggapi, verifikasi ulang tidak dapat dilakukan. Silahkan coba kembali'});
                        }
                        else
                        {
                            console.log('Email sent: ' + info.response);
                            notifier.notify({'title': 'Notifikasi', 'message' : 'Silahkan lakukan verifikasi akun melalui alamat email yang Anda daftarkan'});
                        }
                        res.redirect('/app/login');
                    });
                }
                else
                {
                    notifier.notify({'title': 'Notifikasi', 'message' : 'Server tidak menaggapi, verifikasi ulang tidak dapat dilakukan. Silahkan coba kembali'});
                    res.redirect('/app/login');
                }
            }
            else if(status == "Aktif")
            {
                notifier.notify({'title': 'Notifikasi', 'message' : 'Akun sudah aktif'});
                res.redirect('/app/login');
            }
            else
            {
                notifier.notify({'title': 'Notifikasi', 'message' : 'Server tidak menaggapi, verifikasi ulang tidak dapat dilakukan. Silahkan coba kembali'});
                res.redirect('/app/login');
            }
        }
        else
        {
            notifier.notify({'title': 'Notifikasi', 'message' : 'Email tidak terdaftar'});
            res.redirect('/app/login');
        }
    }
    catch(e)
    {
        console.log(e);
        notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        utils.returnErrorFunction(res, 'Error', e);
    }
};

exports.pdaftar = async function(req, res)
{
    try
    {
        var id = uuidv4();
        if(id == '' || id == null || !id)
        {
            throw 'err';
        }

        var nama = req.body.name;
        if(nama == '' || nama == null || !nama)
        {
            throw 'err';
        }
        
        var em = req.body.email;
        if(em == '' || em == null || !em)
        {
            throw 'err';
        }

        var pass = req.body.password;
        if(pass == '' || pass == null || !pass)
        {
            throw 'err';
        }

        var kv = Task.create_random(6);
        if(kv == '' || kv == null || !kv)
        {
            throw 'err';
        }

        var lv = Task.create_random(30)+kv+nama+Task.create_random(20);
        if(lv == '' || lv == null || !lv)
        {
            throw 'err';
        }

        var url = "http://"+req.get('host')+"/app/mail/"+lv;

        var bw = moment().add(12, 'hours').format('YYYY-MM-DD hh:mm');
        if(bw == '' || bw == null || !bw)
        {
            throw 'err';
        }

        var cekEm = await dbConnection.query("SELECT * FROM login WHERE email = :em_",
        { replacements:{em_:em}, type: sequelize.QueryTypes.SELECT },
        {
            raw: true
        });

        if(cekEm.length > 0)
        {
            notifier.notify({'title': 'Notifikasi', 'message' : 'Email sudah pernah didaftarkan. Registrasi dibatalkan'});
        }
        else
        {
            try
            {
                await dbConnection.query("CALL addCustomer(:nm_, :em_, :pass_, :kv_, :lv_, :bw_, :id_)",
                { replacements:{nm_:nama, em_:em, pass_:pass, kv_:kv, lv_:lv, bw_:bw, id_:id} }).then(function(response){
                        var mailOptions = {
                            from: 'OjekPulo Team noreply@ojekpulo.com',
                            to: em,
                            subject: 'Email Verification',
                            html : "<html><body style='margin: 10px;'><div style='width: 1000px; font-family: Helvetica, sans-serif; font-size: 13px; padding:10px; line-height:150%; border:#eaeaea solid 10px;'>"+ 
                            "<strong>Terima Kasih Telah Mendaftar</strong><br>"+
                            "<b>Nama Anda : </b>"+nama+"<br>"+
                            "<b>Username : </b>"+em+"<br>"+
                            "<b>Kode Verifikasi : </b>"+kv+"<br>"+
                            "<b>URL Link Konfirmasi : </b> <a href='"+url+"'>Klik link ini</a><br>"+
                            "<b>Harap lakukan verifikasi dalam waktu 24 jam.</b><br><br>"+
                            "<img src='https://ojekpulo.000webhostapp.com/assetss/images/kapaltidung.jpg' width='1000' height='200' alt=''/>"+
                            "</div><body></html>"
                        };
        
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                                notifier.notify({'title': 'Notifikasi', 'message' : 'Email verifikasi tidak dapat dikirimkan. Silahkan lakukan kirim ulang verifikasi.'});
                            }
                            else
                            {
                                console.log('Email sent: ' + info.response);
                                notifier.notify({'title': 'Notifikasi', 'message' : 'Registrasi Berhasil. Lakukan verifikasi akun melalui alamat email yang anda daftarkan'});
                            }
                            res.redirect('/app/login');
                        });                    
                    }).error(function(err){
                      throw 'err';
                });
            }
            catch(e)
            {
                console.log(e);
                notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
                utils.returnErrorFunction(res, 'Error', e);
            }
        }
        res.redirect('/app/login');
    }
    catch(e)
    {
        console.log(e);
        notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        utils.returnErrorFunction(res, 'Error', e);
    }
};

exports.pesanan = async function(req, res)
{
    try
    {
        var sesslog = req.session._statlog;
        if(sesslog == "true")
        {
            var sessidcus = req.session._userid;
            var checkbook = await dbConnection.query("SELECT * FROM jadwal JOIN booking ON jadwal.id_jadwal = booking.id_jadwal WHERE booking.id_customer = :idcus_ "+
            "AND (booking.status_pembayaran != 'Expired' AND booking.status_pembayaran != 'Valid') ORDER BY booking.no DESC",
            { replacements:{idcus_:sessidcus}, type: sequelize.QueryTypes.SELECT },
            {
                raw: true
            });

            res.cookie("waktuisi", -1, {expire:120});
            res.render('pesanan',{judul:"true",data:checkbook,sessidcus:sessidcus,statlogin:sesslog,moment:moment});
        }
        else
        {
            notifier.notify({'title': 'Notifikasi', 'message' : 'Masuk kedalam akun Anda untuk dapat melihat daftar pesanan'});
            res.redirect('/app/login');
        }
    }
    catch(e)
    {
        console.log(e);
        notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        utils.returnErrorFunction(res, 'Error', e);
    }
};

exports.pencarian = async function(req, res) {
    try
    {
        var sesslog = req.session._statlog;
        var asal = req.body.asal;
        if(asal == '' || asal == null || !asal)
        {
            throw 'err';
        }
    
        var tujuan = req.body.tujuan;
        if(tujuan == '' || tujuan == null || !tujuan)
        {
            throw 'err';
        }
    
        var date = datetime.create(req.body.datestart).format('Y-m-d');
        if(date == '' || date == null || !date)
        {
            throw 'err';
        }
    
        var pax = req.body.pax;
        if(pax == '' || pax == null || !pax)
        {
            throw 'err';
        }

        var checkavailkapal = await dbConnection.query("SELECT kapal.id_kapal, kapal.nomor_kapal, kapal.nama_kapal, kapal.jumlah_kursi, " +
        "kapal.harga, jadwal.id_jadwal, jadwal.waktu_berangkat, jadwal.waktu_tiba, jadwal.asal, jadwal.tujuan, jadwal.tanggal_berangkat, " +
        "jadwal.tanggal_sampai, SUM(booking.jumlahpenumpang) as dipesan " +
        "FROM kapal JOIN jadwal ON kapal.id_kapal = jadwal.id_kapal LEFT JOIN booking on jadwal.id_jadwal = booking.id_jadwal " +
        "WHERE jadwal.tanggal_berangkat = :tgl_ AND jadwal.asal = :asal_ AND jadwal.tujuan = :to_ GROUP BY jadwal.id_jadwal ORDER BY jadwal.id_jadwal ASC",
        { replacements:{tgl_:date, asal_:asal, to_:tujuan}, type: sequelize.QueryTypes.SELECT },
        {
            raw: true
        });

        if(checkavailkapal.length > 0)
        {
            res.cookie("waktuisi", 120, {expire:120});
            res.render('pencarian',{judul:"true",data:checkavailkapal,asal:asal,tujuan:tujuan,date:date,pax:pax,statlogin:sesslog,moment:moment});
        }
        else
        {
            res.render('pencarian',{judul:"false",asal:asal,tujuan:tujuan,date:date,pax:pax,statlogin:sesslog,moment:moment});
        }
    }
    catch(e)
    {
        console.log(e);
        notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
        utils.returnErrorFunction(res, 'Error', e);
    }
};

exports.booking = async function(req, res){
    var sesslog = req.session._statlog;
    var sessidcus = req.session._userid;
    var waktuisi = req.cookies['waktuisi'];

    if(sesslog == "true")
    {
        try
        {
            var idjad = req.body.idjdwal;
            if(idjad == '' || idjad == null || !idjad)
            {
                throw 'err';
            }

            var jp = req.body.jumlahpenumpang;
            if(jp == '' || jp == null || !jp)
            {
                throw 'err';
            }

            var date = datetime.create(req.body.tanggalberangkat).format('Y-m-d');
            if(date == '' || date == null || !date)
            {
                throw 'err';
            }

            var dates = datetime.create(req.body.tanggalsampai).format('Y-m-d');
            if(dates == '' || dates == null || !dates)
            {
                throw 'err';
            }
    
            var reviewkapalpesanan = await dbConnection.query("SELECT kapal.nama_kapal, kapal.harga, jadwal.id_kapal, jadwal.tanggal_berangkat, jadwal.tanggal_sampai, jadwal.asal, jadwal.tujuan, " +
            "jadwal.waktu_berangkat, jadwal.waktu_tiba FROM kapal JOIN jadwal ON kapal.id_kapal = jadwal.id_kapal WHERE jadwal.id_jadwal = :idjad_",
            { replacements:{idjad_:idjad}, type: sequelize.QueryTypes.SELECT },
            {
                raw: true
            });
    
            if(waktuisi > 0)
            {
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.render('booking',{judul:"true",cowktisi:waktuisi,data:reviewkapalpesanan,sessidcus:sessidcus,idjad:idjad,jp:jp,date:date,dates:dates,statlogin:sesslog,moment:moment});
            }
            else
            {
                notifier.notify({'title': 'Notifikasi', 'message' : 'Waktu pengisian pesanan sudah habis'});
                res.redirect('/app/home');
            }
        }
        catch(e)
        {
            console.log(e);
            notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
            utils.returnErrorFunction(res, 'Error', e);
        }
    }
    else
    {
        res.redirect('/app/login');
    }
};

exports.prosesbooking = async function(req, res)
{
    var transaction = await Sequelize.transaction();
    var sesslog = req.session._statlog;
    if(sesslog == "true")
    {
        try
        {
            var idcus = req.body.idcus;
            var idjad = req.body.idjad;
            var th = req.body.totalharga;
            var pax = req.body.pax;
            var tglotw = req.body.tglotw;
        
            var np = req.body.np;
            var al = req.body.al;
            var nt = req.body.nt;
            var em = req.body.em;

            if(idcus == undefined || idjad == undefined || th == undefined || pax == undefined || tglotw == undefined)
            {
                throw 'err';
            }

            if(np == undefined || al == undefined || nt == undefined || em == undefined)
            {
                throw 'err';
            }

            for(var i=1; i<=pax; i++)
            {
                var noiden = req.body.noiden;
                var nama = req.body.nama;
            }

            //memeriksa ketersediaan tiket sebelum booking - jumlah tiket disediakan
            var check1 = await dbConnection.query("SELECT jadwal.id_kapal, kapal.jumlah_kursi FROM jadwal JOIN kapal ON jadwal.id_kapal = kapal.id_kapal WHERE jadwal.id_jadwal = :idjad_",
            { replacements:{idjad_:idjad}, type: sequelize.QueryTypes.SELECT, transaction: transaction },
            {
                raw: true
            });

            var datatiketada = check1[0]['jumlah_kursi'];

            if(check1.length > 0)
            {
                //memeriksa ketersediaan tiket sebelum booking - jumlah tiket telah dibooking
                var check2 = await dbConnection.query("SELECT SUM(jumlahpenumpang) as tbooked FROM booking WHERE id_jadwal = :idjad_",
                { replacements:{idjad_:idjad}, type: sequelize.QueryTypes.SELECT, transaction: transaction },
                {
                    raw: true
                });

                var datatiketdibook = check2[0]['tbooked'];
                if(datatiketdibook == "" || datatiketdibook == null)
                {
                    datatiketdibook = 0;
                }

                //memeriksa ketersediaan tiket sebelum booking - jumlah tiket memenuhi pesanan booking
                var sisatiket = datatiketada - datatiketdibook;
                if(sisatiket >= pax)
                {
                    var tglnow = moment().format('YYYY-MM-DD HH:mm');
                    var tglnext = moment().add(1, 'hours').format('YYYY-MM-DD HH:mm');
                    var tglbooking = moment().format('YYYY-MM-DD');
                    
                        // var addbook = await dbConnection.query("CALL addBooking(:idjad_,:idcus_,:np_,:alamat_,:notelp_,:pax_,:tb_,:em_,@out,:random_,:tglotw_,:tglnow_,:tglnext_,:tglbooking_)",
                        // { replacements:{idjad_:idjad, idcus_:idcus, np_:np, alamat_:al, notelp_:nt, pax_:pax, tb_:th, em_:em, random_:Task.create_random_number(6), tglotw_:tglotw, tglnow_:tglnow, tglnext_:tglnext, tglbooking_:tglbooking}, transaction: transaction },
                        // {
                        //     raw: true
                        // });

                        var cek = await dbConnection.query("SELECT COUNT(*) as jmlh FROM booking WHERE tanggal_booking = :tglb_",
                        { replacements:{tglb_:moment().format('YYYY-MM-DD')}, type: sequelize.QueryTypes.SELECT, transaction: transaction },
                        {
                            raw: true
                        });
                        
                        var ib = Task.create_random(6);
                        var inv = 'INV8888'+moment().format('YYYYMMDD')+Task.create_random_number(6)+cek[0]['jmlh'];

                        var addbook = await dbConnection.query("INSERT INTO booking (id_booking, id_jadwal, id_customer, nama_pemesan, alamat, notelp, jumlahpenumpang, totalbayar, email_ver, tanggal_booking, tanggal_keberangkatan, invoice_number, session_id, payment_channel, payment_code, status_pembayaran, wm, ws)" +
                        "VALUES (:ib_, :ij_, :ic_, :np_, :a_, :nt_, :jp_, :tb_, :em_, :tglb_, :tglk_, :inv_, :sess_, :pcy_, :pc_, :sp_, :wm_, :ws_)",
                        { replacements:{ib_:ib, ij_:idjad, ic_:idcus, np_:np, a_:al, nt_:nt, jp_:pax, tb_:th, em_:em, tglb_:tglbooking, tglk_:tglotw, inv_:inv, sess_:inv, pcy_:'', pc_:'', sp_:'Pending', wm_:tglnow, ws_:tglnext}, type: sequelize.QueryTypes.INSERT, transaction: transaction },
                        {
                            raw: true
                        })

                        // var rid = await dbConnection.query("SELECT @out as rid",
                        // { type: sequelize.QueryTypes.SELECT, transaction: transaction },
                        // {
                        //     raw: true
                        // });

                        var k;
                        for(k=0; k<pax; k++)
                        {
                                var addrinbook = await dbConnection.query("INSERT INTO rincian_booking(id_booking, noidentitas, nama) VALUES (:idbook_,:noiden_,:nama_)",
                                { replacements:{idbook_:ib, noiden_:noiden[k], nama_:nama[k]}, type: sequelize.QueryTypes.INSERT, transaction: transaction },
                                {
                                    raw: true
                                });
                        }
                        if(k == pax)
                        {
                            await transaction.commit();
                        }
                        else
                        {
                            throw 'err';
                        }
                        res.redirect('/app/pesanan');
                }
                else
                {
                    notifier.notify({'title': 'Notifikasi', 'message' : 'Jumlah pesanan tiket tidak memenuhi jumlah tiket tersedia. Silahkan pesan ulang kembali'});
                    res.redirect('/app/home');
                }
            }
        }
        catch(e)
        {
            await transaction.rollback();
            console.log(e);
            notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
            res.redirect('/app/home');
        }
    }
    else
    {
        res.redirect('/app/login');
    }
};

exports.conpembayaran = async function(req, res)
{
    var sesslog = req.session._statlog;
    if(sesslog == "true")
    {
        try
        {
            var param = req.params.lk;
            if(param == '' || param == null || !param)
            {
                throw 'err';
            }

            var host = req.get('host');
            var link = "http://"+host+"/app/pembayaran/h?"+param;
            var q = urls.parse(link, true);
            var qdata = q.query;
            var idjad = qdata.po;
            var idbook = qdata.pt;

            var review_kapal_booking = await dbConnection.query("SELECT kapal.nama_kapal, kapal.harga, jadwal.id_kapal, jadwal.tanggal_berangkat, jadwal.tanggal_sampai, jadwal.asal, jadwal.tujuan, " +
            "jadwal.waktu_berangkat, jadwal.waktu_tiba, booking.id_booking, booking.tanggal_booking, booking.jumlahpenumpang, booking.totalbayar, " +
            "booking.nama_pemesan, booking.email_ver, booking.invoice_number, booking.status_pembayaran FROM kapal JOIN jadwal ON kapal.id_kapal = jadwal.id_kapal " +
            "JOIN booking ON jadwal.id_jadwal = booking.id_jadwal WHERE jadwal.id_jadwal = :idjad_ AND booking.id_booking = :idbook_",
            { replacements:{idjad_:idjad, idbook_:idbook}, type: sequelize.QueryTypes.SELECT },
            {
                raw: true
            });

            if(review_kapal_booking.length > 0)
            {
                res.render('pembayaran',{judul:"true",idbook:idbook,data:review_kapal_booking,statlogin:sesslog,moment:moment,sha1:sha1});
            }
            else
            {
                notifier.notify({'title': 'Notifikasi', 'message' : 'Data tidak ditemukan'});
                res.redirect('/app/pesanan');
            }
        }
        catch(e)
        {
            console.log(e);
            notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
            utils.returnErrorFunction(res, 'Error', e);
        }
    }
    else
    {
        notifier.notify({'title': 'Notifikasi', 'message' : 'Untuk melanjutkan tahap pembayaran, Anda diharuskan masuk ke dalam Akun'});
        res.redirect('/app/login');
    }
};

exports.cancelbooking = async function(req, res)
{
    var sesslog = req.session._statlog;
    if(sesslog == "true")
    {
        try
        {
            var idbook = req.params.idbook;
            if(idbook == null || idbook == "" || !idbook)
            {
                throw 'err';
            }

            var cancelbooking = await dbConnection.query("SELECT status_pembayaran FROM booking WHERE id_booking = :idbook_",
            { replacements:{idbook_:idbook}, type: sequelize.QueryTypes.SELECT },
            {
                raw: true
            });

            if(cancelbooking.length > 0)
            {
                var statpem = cancelbooking[0]['status_pembayaran'];
                if(statpem == "Pending" || statpem == "ON")
                {
                    await dbConnection.query("CALL cancelBooking(:param1_)",
                    { replacements:{param1_:idbook} },
                    {
                        raw: true
                    });

                    notifier.notify({'title': 'Notifikasi', 'message' : 'Pesanan Anda telah berhasil dibatalkan'});
                }
                else if(statpem == "Expired")
                {
                    notifier.notify({'title': 'Notifikasi', 'message' : 'Pesanan Anda sudah dibatalkan'});
                }
                else
                {
                    notifier.notify({'title': 'Notifikasi', 'message' : 'Pesanan Anda telah berhasil dibayarkan. Pembatalan Pesanan tidak dapat dilakukan'});
                }
            }
            else
            {
                notifier.notify({'title': 'Notifikasi', 'message' : 'Pesanan tidak terdaftar'});
            }
            res.redirect('/app/pesanan');
        }
        catch(e)
        {
            console.log(e);
            notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
            utils.returnErrorFunction(res, 'Error', e);
        }
    }
    else
    {
        notifier.notify({'title': 'Notifikasi', 'message' : 'Masuk kedalam akun Anda untuk dapat melakukan pembatalan pesanan'});
        res.redirect('/app/login');
    }
};

exports.invonumber = async function(req, res)
{
    var sesslog = req.session._statlog;
    if(sesslog == "true")
    {
        try
        {
            var param = req.params.lk;
            if(param == '' || param == null || !param)
            {
                throw 'err';
            }
            
            var data = await dbConnection.query("SELECT * FROM booking WHERE id_booking = :idbook_",
            { replacements:{idbook_:param}, type: sequelize.QueryTypes.SELECT },
            {
                raw: true
            });

            if(data.length > 0)
            {
                res.render('invonumber',{data:data});
            }
            else
            {
                notifier.notify({'title': 'Notifikasi', 'message' : 'Data tidak ditemukan'});
                res.redirect('/app/pesanan');
            }
        }
        catch(e)
        {
            console.log(e);
            notifier.notify({'title': 'Notifikasi', 'message' : 'Terjadi kesalahan pada server. Silahkan coba kembali'});
            utils.returnErrorFunction(res, 'Error', e);
        }
    }
    else
    {
        notifier.notify({'title': 'Notifikasi', 'message' : 'Masuk kedalam akun Anda'});
        res.redirect('/app/login');
    }
};