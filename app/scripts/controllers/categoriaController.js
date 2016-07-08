'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('CategoriaCtrl',  ['$scope', '$rootScope', 
    '$timeout', '$location', 'CategoriaService', 
    function ($scope, $rootScope, $timeout, $location, CategoriaService) {     

  $scope.listSelecionados = [];
  $scope.listItens = [];      

  var lastId = 0;

   $scope.listAll = function() {
        CategoriaService.list().then(function(cats){
            $scope.gridOptions.data = cats;
            if (cats && cats.length > 0) {
                lastId = cats[cats.length-1].id;
            }
        });
   }
   
  $scope.listAll();

  $scope.adicionar = function() {
     lastId++;
     $scope.gridOptions.data.push({id:lastId, nome:"",descricao:""});
  };

  $scope.remover = function() {
    CategoriaService.remove($scope.listSelecionados).then(function(e){
        $scope.listSelecionados = [];
        $scope.listAll();
    });
  };

  $scope.gridOptions = {
    enableRowSelection:true,
    multiSelect:true,
    columnDefs : [
        { name: 'id',    enableCellEdit: false},
        { name: 'nome',  enableCellEdit: true},
        { name: 'descricao',  enableCellEdit: true}
    ],

    onRegisterApi : function(gridApi){
        $scope.gridApi = gridApi;
          gridApi.edit.on.afterCellEdit(
            $scope,function(rowEntity, colDef, newValue, oldValue){
                var msg = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + 
                ' newValue:' + newValue + ' oldValue:' + oldValue ;
                //console.log(msg);
                if (rowEntity.id && rowEntity.nome && rowEntity.nome.trim().length > 0) {
                   $scope.$apply();
                   $timeout(function() {
                        CategoriaService.upsert(rowEntity).then(function(e){
                            $scope.listAll();
                        });
                    }); 
                }
          });

        gridApi.selection.on.rowSelectionChanged($scope,function(row){
            if ($scope.listSelecionados[row.entity.id]) {
                $scope.listSelecionados.splice(row.entity.id,1);
            }
            else {
                $scope.listSelecionados[row.entity.id] = true;
            }
        });
    }
  }
    
}]);