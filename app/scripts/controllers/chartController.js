'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('ChartCtrl', ['$scope','$http','$log','$uibModalInstance','modalParam', 
  function ($scope, $http, $log, $uibModalInstance, modalParam) {
  
  var vm = $scope;

  var stylesDefault = [
      {id:"PieChart",   descricao:"Pizza"},
      {id:"ColumnChart",descricao:"Coluna"}
  ];

  var stylesArea = [
      {id:"AreaChart",  descricao:"Area"}
  ];

  vm.tipoValor = [];
  vm.pieChartTipo = {};

  vm.tiposChart = [];

  var makeChart = function(paramChart) {
    var chart = {};
    chart.data = [[paramChart.labelDesc,paramChart.labelValor,{ role: "style" }]];
    for (var index in  paramChart.collection) {
         chart.data.push(
          [paramChart.collection[index].itemDesc,
           paramChart.collection[index].itemValor,
           '#'+Math.floor(Math.random()*16777215).toString(16)]);
    }

    chart.options = {
        displayExactValues: true,
        width: 400,
        height: 200,
        is3D: true,
        chartArea: {left:10,top:10,bottom:0,height:"100%",width:"100%"}
    };

    chart.formatters = {
        number : [{
            columnNum: 1,
            pattern: "$ #,##0.00"
        }]
    };

    chart.type = paramChart.styles[0].id;

    var grid = {
      columnDefs: [{name:paramChart.labelDesc,  field:'itemDesc'},
                   {name:paramChart.labelValor, field:'itemValor'}],
      data: paramChart.collection            
    };

    return {chart:chart,grid:grid,nome:paramChart.nome,styles:paramChart.styles};
  };
  
  var parseDataValues = function(list,itemDesc,itemValor) {
    var data = [];
    var map = [];
    for (var index in list) {
      var item = list[index];
      if (!map[item[itemDesc]]) {
        map[item[itemDesc]] = {itemDesc:item[itemDesc], itemValor:item[itemValor]};
        data.push(map[item[itemDesc]]);
      }
      else {
        map[item[itemDesc]].itemValor += item[itemValor];
      }
    }

    return data;
  }; 

  var init = function() {
      var list = [];
      for (var index in modalParam.itens) {
        var item = modalParam.itens[index];
        item.valor *= -1;
        list.push(item);
      } 
      if (!list) {
        return;   
      }

      vm.tiposChart.push(makeChart({labelDesc:'Tipo',labelValor:'Valor',
        collection:parseDataValues(list,'tipo','valor'),nome:'Gasto por Tipo',
        styles:stylesDefault}));

      vm.tiposChart.push(makeChart({labelDesc:'Descricão',labelValor:'Valor',
        collection:parseDataValues(list,'descricao','valor'),nome:'Gasto por Descrição',
        styles:stylesDefault}));

      vm.tiposChart.push(makeChart({labelDesc:'Categoria',labelValor:'Valor',
        collection:parseDataValues(list,'categoria','valor'),nome:'Gasto por Categoria',
        styles:stylesDefault}));

      vm.tiposChart.push(makeChart({labelDesc:'Data',labelValor:'Valor',
        collection:parseDataValues(list,'data','valor'),nome:'Gasto por Data',
        styles:stylesArea}));

      vm.tiposChart.push(makeChart({labelDesc:'Dia',labelValor:'Valor',
        collection:parseDataValues(list,'dia','valor'),nome:'Gasto por Dia',
        styles:stylesDefault}));

      vm.dataValue = JSON.stringify(vm.tiposChart[0]);
      vm.pieChartTipo = vm.tiposChart[0].chart;
      vm.grid = vm.tiposChart[0].grid;
      vm.styles = vm.tiposChart[0].styles;
      vm.style = vm.tiposChart[0].styles[0].id;
  };
    
  init();  

  $scope.$watch("style",
    function(newValue, oldValue) {
      if(newValue != oldValue) {
        vm.pieChartTipo.type = newValue;
      }
    }
  );

  $scope.$watch("dataValue",
    function(newValue, oldValue) {
       if(newValue != oldValue) {
          var obj = JSON.parse(newValue);
          vm.pieChartTipo = obj.chart;
          vm.grid = obj.grid;
          vm.styles = obj.styles;
          vm.style = vm.styles[0].id;
       }
    }
  );

  vm.cancelar = function() {
    $uibModalInstance.dismiss();
  };   
    
}]);

