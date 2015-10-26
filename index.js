/**
 * Created by panyanming on 15/10/14.
 */

var conf = require('./app/conf/conf'),
    route = require('./app/route/route'),
    koa = require('koa'),
    serve = require('koa-static'),
    logger = require('koa-logger'),
    bodyparser = require('koa-bodyparser'),
    service = require('./app/service/sqlite'),
    sqlite3 = require('co-sqlite3'),
    compress = require('koa-compress'),
    cors = require('koa-cors'),
    io = require('socket.io');
var join = require('path').join;

var app = koa();
app.use(function *(next){
    this.db = yield sqlite3(conf.db);
    yield next;
});
app.use(cors({origin:'*'}));
app.use(logger());
app.use(bodyparser());
app.use(compress());
app.use(serve(join(__dirname,'www')));
route(app);
var server = require('http').createServer(app.callback());
io = io(server);
io.on('connection', function(socket){
    var ip = socket.client.request.connection.remoteAddress;
    socket.join(ip);
    socket.emit('connection','socket 连接成功,'+ip);
});
global.io = io;
server.listen(9507);