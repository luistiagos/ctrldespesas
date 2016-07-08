'use strict';

var app = angular.module('ctrldespesasApp');

app.factory('CategoriaService', function ($indexedDB, $q) {

    return {

        get: function(id) {
            var deferred = $q.defer();
            $indexedDB.openStore('categoria', function(store){
                store.findBy('nome_idx', id).then(function(e){
                    deferred.resolve(e);
                });
            });

            return deferred.promise;
        },

        list: function() {
            var deferred = $q.defer();
           $indexedDB.openStore('categoria', function(store){
                
                var find = store.query();

                store.eachWhere(find).then(function(e){
                    deferred.resolve(e);
                });
           });

           return deferred.promise;
        },
        
        upsert: function(categoria) {
           var deferred = $q.defer();
           $indexedDB.openStore('categoria', function(store){
                store.upsert(categoria).then(function (e) {
                    deferred.resolve(e);
                });
           });

           return  deferred.promise;    
        },

        remove: function(ids) {
            var deferred = $q.defer();
            $indexedDB.openStore('categoria', function(store){
              for (var id in ids) {
                store.delete(parseInt(id)).then(function (e) {
                    deferred.resolve(e);
                });
              }  
           });

           return  deferred.promise;  
        }
    };

});