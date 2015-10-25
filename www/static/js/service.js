/**
 * Created by panyanming on 15/10/14.
 */

angular.module('HttpModule',[]).factory('http',function($http){
    return {
        getApi : function(condition){
            return $http({
                method : 'POST',
                data : condition||'',
                url : '/getApi/'
            })
        },
        getApiById : function (apid) {
            return $http({
                method : 'POST',
                data : {apid:apid},
                url : '/getApiById/'
            })
        },
        saveApi : function(data){
            return $http({
                method : 'POST',
                data : data,
                url : '/saveApi/'
            })
        },
        checkApi : function(data){
            return $http({
                method : 'POST',
                data : data,
                url : '/checkApi/'
            });
        },
        addApi : function(data){
            return $http({
                method : 'POST',
                data : data,
                url : '/addApi/'
            });
        },
        deleteApi : function(data){
            return $http({
                method : 'POST',
                data : data,
                url : '/deleteApi/'
            });
        },
        setApiActive : function (parentId,stid) {
            return $http({
                method : 'POST',
                data : {apid:parentId,stid:stid},
                url : '/setApiActive/'
            });
        },
        saveApiStatus : function (status) {
            return $http({
                method : 'POST',
                data : status,
                url : '/saveApiStatus/'
            });
        },
        deleteApiStatus : function (stid) {
            return $http({
                method : 'POST',
                data : {stid:stid},
                url : '/deleteApiStatus/'
            });
        }
    }
}).factory('confirm',function($modal){
    var tempModel = {
        templateUrl : "../views/confirm.html",
        backdrop :true,
        animation : false,
        status : 'danger',
        content : '操作不可恢复，是否继续！'
    };
    return {
        showModal : function(opts){
            angular.merge(tempModel, opts);
            if (!tempModel.controller) {
                tempModel.controller = function($scope, $modalInstance){
                    $scope.model = tempModel;
                    $scope.model.ok = $modalInstance.close;
                    $scope.model.cancel = $modalInstance.dismiss;
                }
            };
            return $modal.open(tempModel).result;
        }
    }
}).factory('editStatus',function($modal){
    var tempModel = {
        size : 'lg',
        templateUrl : "../views/edit.status.html",
        backdrop :true,
        animation : false,
    };
    return {
        showModal : function(opts){
            angular.merge(tempModel, opts);
            if (!tempModel.controller) {
                tempModel.controller = function($scope, $modalInstance){
                    $scope.model = tempModel;
                    $scope.model.ok = $modalInstance.close;
                    $scope.model.cancel = $modalInstance.dismiss;
                }
            };
            return $modal.open(tempModel).result;
        }
    }
}).factory('topAlert',function($timeout){
    var elm = angular.element(
        '<div class="alert top-alert animated slideInDown"><button type="button" class="close"><span>×</span></button><div class="content"></div></div>'
    ).hide().appendTo(document.body);
    var model = {
        content:'',
        status:'warning',
        timeout:null
    };
    var timer ='';
    elm.on('click','.close',function(){
        closeAlert();
    });
    function openAlert(options){
        clearTimeout(timer);
        angular.extend(model,options);
        elm.removeClass('alert-danger').removeClass('alert-success').removeClass('alert-warning').addClass('alert-'+model.status);
        elm.find('.content').html(model.content);
        elm.show();
        if(model.timeout){
            timer = $timeout(function(){
                closeAlert();
            },parseInt(model.timeout,10));
        }
    }
    function closeAlert(time){
        clearTimeout(timer);
        elm.hide(time||600);
    }
    return {
        open:openAlert,
        close:closeAlert
    }
}).directive('aceInject',function($timeout){
    var resizeEditor = function (editor, elem) {
        var lineHeight = editor.renderer.lineHeight;
        var rows = editor.getSession().getLength();
        $(elem).height(rows * lineHeight);
        editor.resize();
    };
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: true,
        link: function (scope, elem, attrs, ngModel) {
            var node = elem[0],editor,back = attrs.back;
            editor = ace.edit(node);
            editor.setTheme('ace/theme/tomorrow');
            if(back == 'html'){
                editor.getSession().setMode("ace/mode/html");
            }else{
                editor.getSession().setMode("ace/mode/json");
            }
            editor.setShowPrintMargin(false);
            editor.setHighlightSelectedWord(true);
            ngModel.$render = function () {
                editor.setValue(JSON.stringify(JSON.parse(ngModel.$viewValue), null, 4));
                resizeEditor(editor, elem);
            };
            editor.on('change', function () {
                $timeout(function () {
                    scope.$apply(function () {
                        var value = editor.getValue();
                        ngModel.$setViewValue(value);
                    });
                });
                resizeEditor(editor, elem);
            });
        }
    };
});