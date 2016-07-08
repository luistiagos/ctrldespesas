'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('UploadCtrl',  ['$scope', 'Upload', '$timeout', '$location',
    'DespesaService','$http', '$q',
	function ($scope, Upload, $timeout, $location, DespesaService, $http, $q) {
    
    $scope.tipo = "CD";    

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file]; 
        }
    });
    $scope.log = '';

    var upsertDespesas = function() {
        $http.get('http://localhost:8181/gastos').success(function(itens) {
            for(var item in itens){
               DespesaService.upsert(itens[item]).then(function(){
                    if (parseInt(item) == (itens.length-1)) {
                       $location.path("/categorizacao");
                    }
               });
            }
        });
    };

    var uploadExtratoCD = function(files) {
        for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: 'http://localhost:8181/upload',
                    data: {
                      file: file  
                    }
                }).then(function (resp) {
                    $timeout(function() {
                        $scope.log = 'file: ' +
                        resp.config.data.file.name +
                        ', Response: ' + JSON.stringify(resp.data) +
                        '\n' + $scope.log;
                        $location.path("/grid");
                    });
                }, null, function (evt) {
                    var progressPercentage = parseInt(100.0 *
                            evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + 
                        '% ' + evt.config.data.file.name + '\n' + 
                      $scope.log;
                });
              }
        }
    };

    var uploadExtratoCC = function(files) {
        for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: 'http://localhost:8181/uploadCrediCard',
                    data: {
                      file: file  
                    }
                }).then(function (resp) {
                    $timeout(function() {
                        $scope.log = 'file: ' +
                        resp.config.data.file.name +
                        ', Response: ' + JSON.stringify(resp.data) +
                        '\n' + $scope.log;
                        //$location.path("/grid");
                    });
                }, null, function (evt) {
                    var progressPercentage = parseInt(100.0 *
                            evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + 
                        '% ' + evt.config.data.file.name + '\n' + 
                      $scope.log;
                });
              }
        }
    };

    $scope.upload = function (files) {
        if (files && files.length) {
            if ($scope.tipo == "CD") {
                uploadExtratoCD(files);    
            }
            else {
                uploadExtratoCC(files);
            }
        }
    };
    
}]);
