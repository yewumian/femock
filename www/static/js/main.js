/**
 * Created by panyanming on 15/10/16.
 */
angular.module('MainList',[]).controller('manList', function ($scope,$stateParams,http,confirm,editStatus,CLIENTS) {
    var search = $stateParams._id,condition = {};
    if(search){
        search.replace(/\s/g,'').split('&').forEach(function (val) {
            var tmp = val.split('=');
            if(tmp[1] && tmp != 0){
                condition[tmp[0]] = tmp[1];
            }
        });
    }
    $scope.data = {
        apis :[],
        clients : CLIENTS,
        active : 0
    };
    http.getApi(search?condition:'').success(function(data){
        if(data.flag == 1){
            if(condition.client){
                $scope.data.active = condition.client;
            }else{
                $scope.data.active = 0;
            }
            if(data.data.length){
                $scope.data.apis = data.data;
            }
        }
    });
    $scope.deleteApi = function(apid,parentIndex){
        confirm.showModal({
            content:'删除接口不可恢复！！！'
        }).then(function () {
            http.deleteApi({apid:apid}).success(function(data){
                if(data.flag == 1){
                    console.log(data);
                    $scope.data.apis.splice(parentIndex,1);
                }
            });
        });
    };
    $scope.setApiActive = function(apid,stid){
        http.setApiActive(apid,stid).success(function(data){
            if(data.flag == 1){

            }
        });
    };
    $scope.editStatus = function(parentIndex,index){
        var status = angular.copy($scope.data.apis[parentIndex].status[index]);
        var $parent = $scope;
        editStatus.showModal({
            controller : function($scope,http,$modalInstance){
                $scope.status = status;
                $scope.saveApiStatus = function(form){
                    if(form.$valid){
                        http.saveApiStatus(angular.copy($scope.status)).success(function(data){
                            if(data.flag == 1){
                                $parent.data.apis[parentIndex].status[index] = angular.copy($scope.status);
                            }
                            $modalInstance.dismiss();
                        });
                    }
                }
            }
        });
    };
    $scope.deleteStatus = function(stid,parentIndex,index){
        confirm.showModal({
            content:'删除状态不可恢复！！！'
        }).then(function () {
            http.deleteApiStatus(stid).success(function(data){
                if(data.flag == 1){
                    console.log(data, $scope.data.apis);
                    $scope.data.apis[parentIndex].status.splice(index,1);
                }
            });
        });
    }
});