'use strict';

/**
 * @ngdoc overview
 * @name ctrldespesasApp
 * @description
 * # ctrldespesasApp
 *
 * Main module of the application.
 */
angular
  .module('ctrldespesasApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.grid', 
    'ui.grid.expandable', 
    'ui.grid.selection', 
    'ui.grid.pinning',
    'ui.grid.edit',
    'ui.grid.selection',
    'ui.grid.cellNav',
    'ui.bootstrap', 
    'googlechart',
    'ngFileUpload',
    'ngTagsInput',
    'indexedDB'
  ])
  .config(function ($routeProvider,$indexedDBProvider) {

    $indexedDBProvider
      .connection('ctrldespesasAppDB')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('categoria', {keyPath: 'id'});
        objStore.createIndex('nome_idx', 'nome', {unique: true});
        objStore.createIndex('id_idx', 'id', {unique: true});
    }).upgradeDatabase(2, function(event, db, tx){
        var objStore = db.createObjectStore('despesa', {keyPath: 'id'});
        objStore.createIndex('id_idx', 'id', {unique: true});
    });

    $routeProvider
      .when('/grid', {
        templateUrl: 'views/grid/main.html',
        controller: 'GridCtrl'
      })
      .when('/upload', {
        templateUrl: 'views/upload/main.html',
        controller: 'UploadCtrl'
      })
      .when('/expandableRowTemplate', {
         templateUrl: 'views/grid/expandableRowTemplate.html'
       }
      )
      .when('/categoria', {
         templateUrl: 'views/categoria/main.html',
         controller: 'CategoriaCtrl'
       }
      )
      .when('/categorizacao', {
         templateUrl: 'views/categorizacao/main.html',
         controller: 'CategorizacaoCtrl'
       }
      )
      .otherwise({
        redirectTo: '/grid'
      });
  })
  .run(['$rootScope', function ($rootScope) {
      /*
       $rootScope.categorias = [];
      
       $rootScope.$watch("categorias",
            function(newValue, oldValue ) {
              console.log("$rootScope.categorias:", newValue);
              console.log($rootScope.categorias[2]);
            }
        );
      */
  }]);