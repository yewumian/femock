/**
 * Created by panyanming on 15/9/14.
 */
angular.module('Mock',
    [
        'ngSanitize','ui.bootstrap','ui.router','ngAnimate','ngCookies',
        'CreateApi','HttpModule','MainList','FilterModule','SearchApi','Terminal'
    ])
.run(function($rootScope,$timeout,$cookies,$state,$modal,$stateParams){
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
}).config(function($stateProvider,$urlRouterProvider){
    $urlRouterProvider
        .when('create', '/create/:_id')
        .otherwise('/');
    $stateProvider
        .state("home", {
            url: "/:_id",
            views: {
                '':{
                    templateUrl: './views/main.html'
                },
                'header@home': {
                    templateUrl: './views/header.html'
                },
                'nav@home': {
                    templateUrl: './views/nav.html'
                },
                'api@home': {
                    templateUrl: './views/list.html'
                },
                'log@home': {
                    templateUrl: './views/log.html'
                }
            }
        })
        .state("create",{
            url: "/create/:_id",
            views: {
                '':{
                    templateUrl: './views/create.html'
                },
                'header@create': {
                    templateUrl: './views/header.html'
                },
                'nav@create': {
                    templateUrl: './views/nav.html'
                },
                'log@create': {
                    templateUrl: './views/log.html'
                }
            }
        });
}).constant('CLIENTS',['a','acs','artile','ats','b','c','campus','clt','company','erp','event','fb','h','it','job','msk','rts','sns','www']);