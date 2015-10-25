/**
 * Created by panyanming on 15/10/14.
 */

var join = require('path').join;
var root = join(__dirname,'../');
module.exports = {
    root : root,
    port : 3001,
    db : join(root,'db/mock.db')
};