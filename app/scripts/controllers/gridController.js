'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('GridCtrl', ['$scope', '$http', '$log', 'uiGridConstants','$uibModal', 
    function ($scope, $http, $log, uiGridConstants, $uibModal) {
  
  var weekday = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sabado"];    
    
  $http.defaults.useXDomain = true;
  $scope.total = 0;
  $scope.gridId=1;
  $scope.categorias = [];
  $scope.descXTipo  = [];
  $scope.descXCateg = [];
  $scope.filtro = {tipoHas:'',tipos:[],mesVig:(new Date().getMonth()+1)};
  $scope.tipos = [{tipo:'SAQUE'},{tipo:'COMPRA'},{tipo:'CARTÃO CREDITO'},{tipo:'MENSAL'}];    
    
  $scope.gridOptions = {
    columnDefs: [{name:"Data", field:"data"},
                 {name:"Dia", field:"dia"},       
                 {name:"Valor", field:"valor"}],
    expandableRowTemplate: 'views/grid/expandableRowTemplate.html',
    expandableRowHeight: 300,
    expandableRowScope: {
      subGridVariable: 'subGridScopeVariable'
    }
  };

  $scope.gridAllOptions = {
    columnDefs: [{name:"Id",        field:"id", visible:false},
                 {name:"Data",      field:"data"},
                 {name:"Dia",       field:"dia"}, 
                 {name:"Hora",      field:"hora"},
                 {name:"Tipo",      field:"tipo", minWidth: 100},
                 {name:"Descrição", field:"descricao", minWidth: 200},  
                 {name:"Categoria", field:"categoria", minWidth: 100}, 
                 {name:"Valor",     field:"valor"}]
  };

  $scope.gridEditableOptions = {
    columnDefs: [{name:"Id",        field:"id", visible:false},
                 {name:"Data",      field:"data", enableCellEdit: false, visible:false},
                 {name:"Tipo",      field:"tipo", enableCellEdit:true},
                 {name:"Descrição", field:"descricao", enableCellEdit: false, minWidth: 300},   
                 {name:"Categoria", field:"categoria", enableCellEdit: true,  minWidth: 300}, 
                 {name:"Valor",     field:"valor", enableCellEdit: false, visible:false}],
    
    onRegisterApi : function(gridApi){
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit(
              $scope,function(rowEntity, colDef, newValue, oldValue){
                  var msg = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + 
                  ' newValue:' + newValue + ' oldValue:' + oldValue ;
                  var list = $scope.gridEditableOptions.data;
                  for (var i=0;i<list.length;i++) {
                      var idx = list[i].descricao + list[i].tipo;
                      var idx2 = rowEntity.descricao + rowEntity.tipo;
                     if (idx == idx2 && colDef.name == 'Categoria') {
                      if (rowEntity.categoria && ($scope.refletirTodos || rowEntity.id == colDef.id)) {
                        list[i].categoria = rowEntity.categoria;
                        $http.post('http://localhost:8181/atualizarGasto',list[i]);
                        if ($scope.refletirTodos) {
                          $http.post('http://localhost:8181/atualizarMapaDescricaoCategoria',
                          {descricao:list[i].descricao,categoria:list[i].categoria});
                        }
                      }
                    }
                  }
                  
                  $scope.$apply(); 
            })
    }   
  };

  var zeroComplete = function(vlr) {
     return (vlr < 10)?"0"+vlr:vlr;
  }

  var strToData = function(vlr) {
     var date = new Date(vlr);
     return (zeroComplete(date.getDate()) + "/" +  zeroComplete(date.getMonth() + 1) + "/" + date.getFullYear());	
  }
  
  var strToHour = function(vlr) {
     var date = new Date(vlr);
     return (zeroComplete(date.getHours()) + ":" +  zeroComplete(date.getMinutes() + 1) + ":" + zeroComplete(date.getSeconds()));	
  }

  var clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
  
  var getDia = function(vlr) {
    return weekday[new Date(vlr).getDay()];   
  }

  var getFilteredItensByMes = function(returnItens, mes) {
    var listItens = [];
    if (returnItens && returnItens.length > 0) {
        for (var index in returnItens) {
             var item = returnItens[index];
             if(item.data) {
                var date = new Date(item.data);
                if ((date.getMonth()+1) == mes) {
                    listItens.push(item);
                }
             }
        } 
    }
    return listItens;
  };

  var getFilteredItensByTipo = function(returnItens) {
    if ($scope.filtro.tipos && $scope.filtro.tipos.length > 0 && 
        $scope.filtro.tipoHas && $scope.filtro.tipoHas.length > 0) {
      var itensFiltreds = [];
      for (var i=0;i<returnItens.length;i++) {        
        if($scope.filtro.tipoHas) {
          var hasTipo = false;
          for (var j=0;j<$scope.filtro.tipos.length;j++) {
            var tp = returnItens[i].tipo.toUpperCase();
            if($scope.filtro.tipos[j] && (tp == $scope.filtro.tipos[j].text.toUpperCase())){
                hasTipo = true;
                if ($scope.filtro.tipoHas == "S") {
                  itensFiltreds.push($scope.returnItens[i]);
                }      
            }
          }
          if ($scope.filtro.tipoHas == "N" && !hasTipo) {
             itensFiltreds.push($scope.returnItens[i]);
          }
        }
      }
      return itensFiltreds;
    }
    return returnItens;
  };

  var populaGrids = function(itens) {
        $scope.total = 0;
        var mapData = [];
        var mapTipo = [];
        var itensDias = [];
        var listItens = [];
        var itensc = [];
      
        for(var i = 0; i < itens.length; i++){
          var item = itens[i];
          if (item.data && item.valor < 0 && item.descricao) {
                listItens.push(item);
                var date = strToData(item.data);
                var itemc = clone(item);
                itemc.data = strToHour(itemc.data);
                if (!mapData[date]) {
                   mapData[date] = {data:date,valor:item.valor,dia:getDia(item.data),subItens:[itemc]};                 
                }
                else {
                   mapData[date].valor += item.valor; 
                   mapData[date].subItens.push(itemc);       
                }
               
                if(!mapTipo[item.tipo]) {
                   mapTipo[item.tipo] = item.valor;        
                }
                else {
                  mapTipo[item.tipo] += item.valor;  
                }
          }
        }
      
        for (var itemDia in mapData) {
          mapData[itemDia].valor = (Math.round(mapData[itemDia].valor * 100) / 100);
          $scope.total += mapData[itemDia].valor;
          mapData[itemDia].subGridOptions = {
             columnDefs: [{name:"Id",    field:"id", visible:false},
                          {name:"Hora",  field:"data"},
                          {name:"Tipo",  field:"tipo", minWidth:100},
                          {name:"Categ.",field:"categoria", minWidth:100},
                          {name:"Desc.", field:"descricao", minWidth:200},
                          {name:"Valor", field:"valor"}],
             data: mapData[itemDia].subItens
          }
          itensDias.push(mapData[itemDia]);
          for (var i=0;i<mapData[itemDia].subItens.length;i++) {
            var parentItem = mapData[itemDia];
            var childItem  = mapData[itemDia].subItens[i];
            itensc.push({id:childItem.id,
                         data:parentItem.data,
                         dia:parentItem.dia,
                         hora:childItem.data,
                         tipo:childItem.tipo,
                         categoria:childItem.categoria,
                         descricao:childItem.descricao,
                         valor:childItem.valor
                       });
          }
        }
      
        $scope.total = Math.round($scope.total * 100) / 100;
        $scope.gridAllOptions.data = itensc;
        $scope.gridOptions.data = itensDias;
        $scope.gridEditableOptions.data = itensc;
  };

  $http.get('http://localhost:8181/gastos')
      .success(function(itens) {
       $scope.returnItens = itens;
       populaGrids(getFilteredItensByMes(itens,$scope.filtro.mesVig)); 
  });

  $scope.$watchCollection("filtro.tipos",
      function( newValue, oldValue ) {
        if ($scope.returnItens) {
          populaGrids(getFilteredItensByTipo($scope.returnItens));
        }
      }
  );

  $scope.$watch("filtro.mesVig",
    function(newValue, oldValue) {
      if ($scope.returnItens) {
        populaGrids(getFilteredItensByMes($scope.returnItens,newValue));
      }
    }
  );

  $scope.gridOptions.onRegisterApi = function(gridApi){
    $scope.gridApi = gridApi;
  };

  $scope.expandAllRows = function() {
    $scope.gridApi.expandable.expandAllRows();
  }

  $scope.collapseAllRows = function() {
    $scope.gridApi.expandable.collapseAllRows();
  }
  
  $scope.dashBoards = function() {
    var modalInstance = $uibModal.open({
        templateUrl: 'views/dashboards/main.html',
        controller: 'ChartCtrl',
        resolve: {
          modalParam : function() {
            return {
              itens: $scope.gridAllOptions.data
            };
          }
        },
        size: 'md'
      });
  };

}]);

