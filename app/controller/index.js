/**
 * Created by panyanming on 15/10/14.
 */

function groupData(result){
    var data = [],temp = {};
    result.forEach(function(obj){
        var key = obj.apid;
        if(!temp[key]){
            temp[key] = {
                apid : obj.apid,
                client : obj.client,
                name : obj.name,
                author : obj.author,
                path : obj.path,
                param : obj.param||'',
                eg : obj.eg,
                method : obj.method,
                back : obj.back,
                active : obj.active==0?obj.stid:obj.active,
                status : []
            }
        }
        temp[key].status.push({
            stid : obj.stid,
            description : obj.description,
            code : obj.code
        });
    });
    Object.keys(temp).forEach(function (key) {
        data.push(temp[key]);
    });
    return data.reverse();
}

module.exports = [
    {
        route : '/getApi',
        method : 'all',
        callback: function *(){
            var ctx = this,result,sql,request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query,dt,time,day = 60*60*24;
            sql = "SELECT a.*, b.* FROM api_info a JOIN api_status b on b.target = a.apid";
            if(request.client){
                sql +=" AND a.client='"+request.client+"'";
            }
            if(request.time){
                //datetime 接收秒的转化
                dt = Math.ceil(new Date()/1000);
                if(request.time == 1){
                    time = dt-day;
                }
                if(request.time == 2){
                    time = dt-day*7;
                }
                if(request.time == 3){
                    //约等于1个月内
                    time = dt-day*31;
                }
                if(request.time == 4){
                    //约等于半年内
                    time = dt-day*183;
                }
                sql +=" AND a.time > datetime('"+time+"','unixepoch','localtime') "
            }
            if(request.key){
                sql +=" AND a.name LIKE '%"+request.key+"%'";
            }
            sql +=" ORDER BY a.apid DESC";
            result = yield ctx.db.all(sql);
            if(result.length){
                this.body = {flag:1,data:groupData(result)}
            }else{
                this.body = {flag:1,data:[]};
            }
        }
    },
    {
        route : '/getApiById',
        method : 'all',
        callback: function *(){
            var ctx = this,end={},result,sql,request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            sql = "SELECT a.*, b.* FROM api_info a JOIN api_status b on b.target = a.apid";
            if(request.apid){
                sql +=" AND a.apid='"+request.apid+"'";
            }else{
                this.body = {flag: 0, msg: "参数有误"};
                return;
            }
            result = yield ctx.db.all(sql);
            if(result.length){
                end = {flag:1,data:groupData(result)}
            }else{
                end = {flag:0,msg:'接口不存在'};
            }
            this.body = end;
        }
    },
    {
        route : '/checkApi',
        method : 'all',
        callback : function*(){
            var ctx = this,end={},result,sql,request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            if(!request.client || !request.path){
                this.body =  {flag:0,msg:'查询参数有误!'};
                return
            }
            sql = "SELECT * FROM api_info WHERE client='"+request.client+"' AND path='"+request.path+"'";
            if(request.apid){
                sql +=" AND apid<>'"+request.apid+"'"
            }
            result = yield ctx.db.all(sql);
            if(result.length){
                end = {flag:0,msg:'接口已存在!'}
            }else{
                end = {flag:1,data:[]};
            }
            this.body = end;
        }
    },
    {
        route : '/addApi',
        method : 'all',
        callback: function* (){
            var ctx = this,result,status,statusArr,sqlErr= [],request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            var sql = "INSERT INTO api_info (client,name,path,author,param,eg,method,back,active) " +
                "VALUES($client,$name,$path,$author,$param,$eg,$method,$back,0)";
            var sql2 = "INSERT INTO api_status (target,description,code) " +
                "VALUES($target,$description,$code)";
            var prefixREG = /\$[a-z0-9]+\b/ig;
            result = yield ctx.db.run(sql.replace(prefixREG,function(key){
                return "'"+request.apiInfo[key.replace('$','')]+"'";
            }));
            statusArr = request.apiStatus.status;
            if(result && result.lastID && statusArr.length){
                sql2 = sql2.replace('$target', result.lastID);
                for(var i =0;i<statusArr.length;i++){
                    status = yield ctx.db.run(sql2.replace(prefixREG,function(key){
                        return "'"+statusArr[i][key.replace('$','')]+"'";
                    }));
                    if(!status.lastID){
                        sqlErr.push(statusArr[i].description);
                    }
                }
            }
            if(!sqlErr.length){
                ctx.body = {flag:1}
            }else{
                ctx.body = {
                    flag : 0,
                    msg : '插入数据失败: '+sqlErr.join()
                };
            }
        }
    },
    {
        route : '/saveApi',
        method : 'all',
        callback: function *(){
            var ctx = this,result,status,statusArr,sqlErr= [],runsql,request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            //console.log(request);
            var sql = "UPDATE api_info SET" +
                " client=$client,name=$name,path=$path,author=$author,param=$param,eg=$eg,method=$method,back=$back " +
                "WHERE apid='"+request.apiInfo.apid+"'";
            var sql2 = "INSERT INTO api_status (target,description,code) " +
                "VALUES($target,$description,$code)";
            var sql3 = "UPDATE api_status SET description=$description,code=$code " +
                "WHERE stid=$stid";
            var prefixREG = /\$[a-z0-9]+\b/ig;
            result = yield ctx.db.run(sql.replace(prefixREG,function(key){
                return "'"+request.apiInfo[key.replace('$','')]+"'";
            }));
            statusArr = request.apiStatus.status;
            if(result && result.changes && statusArr.length){
                for(var i =0;i<statusArr.length;i++){
                    runsql = statusArr[i].stid ? sql3 : sql2.replace('$target', request.apiInfo.apid);
                    status = yield ctx.db.run(runsql.replace(prefixREG,function(key){
                        return "'"+statusArr[i][key.replace('$','')]+"'";
                    }));
                    if(!status.changes && !status.lastID){
                        sqlErr.push(statusArr[i].description);
                    }
                }
            }
            if(!sqlErr.length){
                ctx.body = {flag:1}
            }else{
                ctx.body = {
                    flag : 0,
                    msg : '插入数据失败: '+sqlErr.join()
                };
            }
        }
    },
    {
        route: '/deleteApi/*',
        method: 'all',
        callback: function *() {
            var ctx = this, result, sql, request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            if (!request.apid) {
                this.body = {flag: 0, msg: '缺少参数'};
                return;
            }
            sql = "DELETE FROM api_info WHERE apid='" + request.apid + "'";
            result = yield ctx.db.run(sql);
            if (!result.changes) {
                this.body = {flag: 0, msg: "参数有误"};
                return
            }
            sql = "DELETE FROM api_status WHERE target='" + request.apid + "'";
            result = yield ctx.db.run(sql);
            if (!result.changes) {
                this.body = {flag: 0, msg: "参数有误"};
            }else{
                this.body = {flag: 1, data: []};
            }
        }
    },
    {
        route : '/deleteApiStatus/*',
        method : 'all',
        callback: function *(){
            var ctx = this, result, sql, request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            if (!request.stid) {
                this.body = {flag: 0, msg: '缺少参数'};
                return;
            }
            sql = "DELETE FROM api_status WHERE stid='" + request.stid + "'";
            result = yield ctx.db.run(sql);
            console.log(!!result, result);
            if (result.changes) {
                this.body = {flag: 1, data: []}
            } else {
                this.body = {flag: 0, msg: "参数有误"};
            }
        }
    },
    {
        route : '/setApiActive/*',
        method : 'all',
        callback: function *(){
            var ctx = this,result,sql,request = ctx.request.method.toLowerCase() == 'post' ?  ctx.request.body : ctx.request.query;
            if(!request.stid || !request.apid){
                this.body = {flag:0,msg:'缺少参数'};
                return;
            }
            sql = "UPDATE api_info SET active='"+request.stid+"' WHERE apid ='"+request.apid+"'";
            result = yield ctx.db.run(sql);
            if(result.changes){
                this.body = {flag:1,data:[]}
            }else{
                this.body = {flag:0,msg:"参数有误"};
            }
        }
    },
    {
        route: '/saveApiStatus/*',
        method: 'all',
        callback: function *() {
            var ctx = this, result, sql, request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query;
            if (!request.stid || !request.code || !request.description) {
                this.body = {flag: 0, msg: '缺少参数'};
                return;
            }
            sql = "UPDATE api_status SET code='"+request.code+"', description='"+request.description+"' WHERE stid='" + request.stid + "'";
            result = yield ctx.db.run(sql);
            if (result.changes) {
                this.body = {flag: 1, data: []}
            } else {
                this.body = {flag: 0, msg: "参数有误"};
            }
        }
    },
    {
        route : '/*',
        method : 'all',
        callback: function *(){
            var ctx = this,
                terminal = {flag:1,param:[]},
                send,
                start = Date.now(),
                result = [],
                sql = "SELECT a.*, b.* FROM api_info a JOIN api_status b on b.target = a.apid",
                ip =ctx.request.ip || ctx.request.ips.length && ctx.request.ips[0],
                method = ctx.method.toUpperCase(),
                path = ctx.path,
                request = ctx.request.method.toLowerCase() == 'post' ? ctx.request.body : ctx.request.query,
                client = request.client;
                console.log(ctx.method);
            if(path !== '/favicon.ico' && !/static/.test(path)){
                sql += " AND a.path = '"+path+"'";
                if(client){
                    sql += " AND a.client = '"+client+"'";
                }
                result = yield ctx.db.all(sql);
                if(result.length){
                    result = groupData(result)[0];
                    if(result.method.toUpperCase() != method && result.method != 'all'){
                        terminal.flag = 0;
                        terminal.method = '请求方式错误,接收:'+result.method.toUpperCase();
                    }
                    result.param.split(/[,]/g).forEach(function(val){
                        if(!val in request){
                            terminal.flag = 0;
                            terminal.param.push(val+'=null');
                        }else{
                            terminal.param.push(val?val+'='+request[val]:'');
                        }
                    });
                    terminal.client = result.client;
                    if(terminal.flag == 1){
                        if(result.active == 0){
                            send = result.status[0];
                        }else{
                            result.status.forEach(function(obj){
                                if(obj.stid == result.active){
                                    send = obj.code;
                                    return;
                                }
                            });
                        }
                        if(result.back == 'json'){
                            try{
                                 send = JSON.parse(send);
                            }catch(e){
                                send = e;
                            }
                        }
                        this.body = send;
                        terminal.code = send;
                    }
                }else{
                    terminal.flag = 0;
                    terminal.path = path+' 请求地址不存在';
                }
                terminal.time = Date.now() - start;
                terminal.path = terminal.path||path;
                terminal.method = terminal.method||method;
                terminal.client = terminal.client||client;
                ip && io.sockets.in(ip).emit('terminal',terminal);
                if(terminal.flag = 0){
                    this.throw('request error, care terminal log please!', 400);
                }
            }else{
                this.throw('Not found!', 404);
            }
        }
    }
];