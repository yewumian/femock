/**
 * Created by panyanming on 15/10/14.
 */

var route = require('koa-route'),
    controller = require('../controller');

module.exports = function(app){
    controller.forEach(function(obj){
        app.use(route[obj.method](obj.route,obj.callback));
    });
};