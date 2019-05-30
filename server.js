const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    controller = require('./controller/controller'),
    controllerAPI = require('./controller/controllerAPI');

const cookie = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets',express.static(__dirname + '/public'));
app.use(session({secret:'session', saveUninitialized:true, resave:true}));
app.use(cookie());
app.use(bodyParser.json());

const routes = require('./router/routes');
routes(app);

app.use(function(req, res){
    /*
    res.status(404).send({
        endpoint: req.originalUrl + ' not found'
    })
    */
    res.write('<html><head></head><body>');
    res.write('<script>window.location.href="javascript:history.back(-1)"</script>');
    res.end('</body></html>');
    return;
})

app.listen(port);
console.log('RESTful API server started on http://localhost:' + port);