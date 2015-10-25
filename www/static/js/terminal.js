/**
 * Created by panyanming on 15/10/16.
 */

angular.module('Terminal',[]).controller('terminal', function ($scope,$timeout) {
    var socket = io.connect();
    var terminal = angular.element('#terminal');
    $scope.data = {
        logs : []
    };
    socket.on('connection', function(msg){
        console.log(msg)
    });
    socket.on('terminal',function(data){
        $scope.$apply(function () {
            if(typeof data.code =='object'){
                data.code = JSON.stringify(data.code,null,4);
                console.log(data.code);
            }
            $scope.data.log = $scope.data.logs.push(data);
            $timeout(function(){
                terminal.scrollTop(100000);
            },50);
        });
    });
    $scope.cleanLogs = function(){
        $scope.data.logs = [];
    }
});