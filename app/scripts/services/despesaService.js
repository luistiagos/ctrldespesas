'use strict';

var app = angular.module('ctrldespesasApp');

app.factory('DespesaService', function ($indexedDB, $q) {

    return {

        get: function(id) {
            var deferred = $q.defer();
            $indexedDB.openStore('despesa', function(store){
                store.findBy('nome_idx', id).then(function(e){
                    deferred.resolve(e);
                });
            });

            return deferred.promise;
        },

        list: function() {
            var deferred = $q.defer();
           $indexedDB.openStore('despesa', function(store){
                var find = store.query();
                store.eachWhere(find).then(function(e){
                    deferred.resolve(e);
                });
           });

           return deferred.promise;
        },
        
        upsert: function(despesa) {
           var deferred = $q.defer();
           $indexedDB.openStore('despesa', function(store){
                store.upsert(despesa).then(function (e) {
                    deferred.resolve(e);
                });
           });

           return  deferred.promise;    
        },

        remove: function(ids) {
            var deferred = $q.defer();
            $indexedDB.openStore('despesa', function(store){
              for (var id in ids) {
                store.delete(parseInt(id)).then(function (e) {
                    deferred.resolve(e);
                });
              }  
           });

           return  deferred.promise;  
        },

        clear: function() {
          var deferred = $q.defer();
          $indexedDB.openStore('despesa', function(store){
              store.clear().then(function(){
                  deferred.resolve();
              });
          });

          return deferred.promise;
        }
  }      
});