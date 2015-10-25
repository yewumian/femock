/**
 * Created by panyanming on 15/10/14.
 */
var api = {
    apiInfo : {
        client : '',
        name : '',
        path : '',
        author : '',
        param : '',
        eg : '',
        method : 'all',
        back : 'json'
    },
    apiStatus : {
        status : [{
            description : '失败',
            code : '{"flag": 0,"code": "***","msg": "some error message."}'
        },
        {
            description : '成功',
            code : '{"flag": 1,"data": {}}',
            simpleSuccess: 1
        }]
    },
    otherSuccess : {
        description : '成功-$1',
        code : '{"flag": 1,"data": {"biz_code": "***","msg": "some notice message.","***": "some value"}}'
    }
};
angular.module('CreateApi',[]).controller('createApi',function($scope,$rootScope,$state,$stateParams,http,topAlert,CLIENTS){
    var count = 0;
    $scope.data = {
        apiInfo : {},
        apiStatus : {},
        clients : CLIENTS
    };
    $scope.foundId = '';
    if($stateParams._id){
        http.getApiById($stateParams._id).success(function(data){
            if(data.flag == 1){
                $scope.foundId = $stateParams._id;
                $scope.data.apiStatus.status = data.data[0].status;
                angular.merge($scope.data.apiInfo,data.data[0]);
            }else{
                $state.go('create',{_id:''});
            }
        });
    }else{
        angular.merge($scope.data.apiInfo,api.apiInfo);
        angular.merge($scope.data.apiStatus,api.apiStatus);
    }
    $scope.$watch('data.apiInfo.back',function(){
        $scope.data.apiStatus = angular.copy($scope.data.apiStatus);
    });
    $scope.addSuccess = function(){
        var otherSuccess = angular.copy(api.otherSuccess);
        otherSuccess.description = otherSuccess.description.replace('$1',++count);
        $scope.data.apiStatus.status.push(otherSuccess);
    };
    $scope.delStatus = function(index){
        $scope.data.apiStatus.status.splice(index,1);
    };
    $scope.addApi = function(form){
        if(form.$valid){
            http.checkApi($scope.data.apiInfo).success(function(data){
                if(data.flag == 1){
                    http.addApi(angular.copy($scope.data)).success(function(data){
                        if(data.flag == 1){
                            $state.go('home',{});
                        }else{
                            topAlert.open({content:data.msg||'添加接口失败',status:'danger'})
                        }
                    });
                }else{
                    topAlert.open({content:data.msg||'添加接口失败',status:'danger'})
                }
            });
        }
    };
    $scope.saveApi = function(form){
        if(form.$valid){
            http.checkApi($scope.data.apiInfo).success(function(data){
                if(data.flag == 1){
                    http.saveApi(angular.copy($scope.data)).success(function(data){
                        if(data.flag == 1){
                            $state.go('home',{_id:''});
                        }else{
                            topAlert.open({content:data.msg||'保存接口失败',status:'danger'})
                        }
                    });
                }else{
                    topAlert.open({content:data.msg||'保存接口失败',status:'danger'})
                }
            });
        }
    }
}).directive('validatorsEmail',function(){
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9]+\.com$/i;
    return {
        require : 'ngModel',
        restrict: 'A',
        link : function(scope,elm,attr,ctrl){
            if(ctrl && ctrl.$validators.email){
                ctrl.$validators.email = function(modelValue) {
                    return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                };
            }
        }
    }
});