'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('CategorizacaoCtrl',  ['$scope', '$rootScope', 
    '$timeout', '$location','DBService',
    function ($scope, $rootScope, $timeout, $location, DBService) {     

  $scope.categorias = [];
  $scope.itens = [];
  $scope.itensCategoria = [];
  $scope.despesas = [];
  var mapItemCateg = [];
  
  var initialize = function() {
     DBService.list('categoria').then(function(list){
       for (var categ in list) {
          $scope.categorias.push({nome:list[categ].nome});
       }

       DBService.list('despesa').then(function(list){
          mapItemCateg = [];
          for (var item in list) {
              var desp = list[item];
              $scope.despesas[desp.descricao] = desp;
              if(desp.tipo == "COMPRA" && !mapItemCateg[desp.descricao]) {
                $scope.itensCategoria.push({nome:desp.descricao, categoria:desp.categoria});
                mapItemCateg[desp.descricao] = true;
              }
          }

          $scope.gridOptions.data = $scope.itensCategoria;
      });
    });
  };
  
  initialize();

  $scope.gridOptions = {
    columnDefs : [
        { name: 'nome',  enableCellEdit: false},
        { name: 'categoria', editableCellTemplate: 'ui-grid/dropdownEditor',
            editDropdownValueLabel: 'nome', 
            cellFilter: 'mapCategoria',
            editDropdownOptionsArray: $scope.categorias
        }
    ],

    onRegisterApi : function(gridApi){
      
        $scope.gridApi = gridApi;
          gridApi.edit.on.afterCellEdit(
            $scope,function(rowEntity, colDef, newValue, oldValue){
                var msg = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + 
                ' newValue:' + newValue + ' oldValue:' + oldValue ;
                console.log(msg);
                if (rowEntity.nome && rowEntity.nome.trim().length > 0 && 
                    rowEntity.categoria && rowEntity.categoria.trim().length > 0) {
                   $scope.$apply();
                   $timeout(function() {
                        DBService.upsert('itemCategoria',
                          {nome:rowEntity.nome,
                           categoria:rowEntity.categoria}
                        ).then(function(){
                            DBService.upsert('despesa',$scope.despesas[desp.descricao]);
                        });
                    }); 
                }
          })
          .filter('mapCategoria', function() {
            return function(input) {
               return input;
            }
          });
    }
  };
    
}]);