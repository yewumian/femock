/**
 * Created by panyanming on 15/10/19.
 */
angular.module('FilterModule',[]).filter('unSafeHtml',function($sce){
    return function(html){
        return $sce.trustAsHtml(html);
    }
}).filter('unSafeSource',function($sce){
    return function(html){
        return $sce.trustAsResourceUrl(html);
    }
});