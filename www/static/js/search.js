/**
 * Created by panyanming on 15/10/16.
 */

angular.module('SearchApi',[]).controller('searchApi', function ($scope,$state,$stateParams,$timeout,CLIENTS) {
    var search = $stateParams._id,condition = {};
    if(search){
        search.replace(/\s/g,'').split('&').forEach(function (val) {
            var tmp = val.split('=');
            if(tmp[1]){
                condition[tmp[0]] = tmp[1];
            }
        });
    }
    $scope.data = {
        time : condition.time||'0',
        key : condition.key||'',
        clients : CLIENTS
    };
    $timeout(function(){
        $scope.data.client = condition.client||'0';
    });
    $scope.searchApi = function(){
        var _id = '';
        if($scope.data.client && $scope.data.client!=0){
            _id+='client='+$scope.data.client;
        }
        if($scope.data.time && $scope.data.time!=0){
            if(_id){
                _id+='&';
            }
            _id+='time='+$scope.data.time;
        }
        if($scope.data.key){
            if(_id){
                _id+='&';
            }
            _id+='key='+$scope.data.key;
        }
        $state.go('home',{
            _id: _id
        });
    }
});