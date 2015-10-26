##### FEMock

##### 安装

##### nodejs & npm

* nodejs >= 0.12.0

* npm install femock

#### 使用

* pm2 start pm2.json 或者 node --harmony index.js

* 默认端口 9507

* 可以编辑nginx.conf,绑定域名; 

````
    upstream femock.com {
        server  127.0.0.1:9507;
    }

    server {
        listen       80;
        server_name femock.com;
        root  /node/femock;
        index index.html index.shtml index.htm;
        location / {
            proxy_pass         http://femock.com; 
            proxy_set_header   Host             $host; 
            proxy_set_header   X-Real-IP        $remote_addr; 
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection "upgrade";
            proxy_http_version 1.1;
        }
    }
````

* 提供数据模拟功能，按路径返查询数据，并根据设置的接口返回状态，返回相应的数据;

* 添加接口: 支持3种请求方式，2种返回方式，接收参数为接口接收的必填字段，多个字段使用逗号分隔;

* 同一业务线不允许有相同路径存在，唯一接口可以直接使用路径访问，重复路径请加 client : '*' 字段加以区分(*号为业务线值，小写字母，如:c)

* 加入socket.io 推送处理情况, 按ip分组多点推送消息
 
````
未绑定域名：
$.ajax({
    url : 'http://127.0.0.1:9507/mock/test',
    data : {ac:1, ab:'b'},
    type : 'get',
    success : function(data){
        console.log(data)
    }
});

$.ajax({
    url : 'http://127.0.0.1:9507/mock/test',
    data : {ac:1, ab:'b',client:'b'},
    type : 'get',
    success : function(data){
        console.log(data)
    }
});
绑定域名：
$.ajax({
    url : 'http://femock.com/mock/test',
    data : {ac:1, ab:'b',client:'b'},
    type : 'get',
    success : function(data){
        console.log(data)
    }
});
````