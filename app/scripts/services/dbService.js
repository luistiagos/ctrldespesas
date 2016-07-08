'use strict';

var app = angular.module('ctrldespesasApp');

app.factory('DBService', function ($indexedDB, $q) {

    return {

        get: function(entity,obj) {
            var deferred = $q.defer();
            $indexedDB.openStore(entity, function(store){
                store.findBy(obj.indexx, obj.key).then(function(e){
                    deferred.resolve(e);
                });
            });

            return deferred.promise;
        },

        list: function(entity) {
            var deferred = $q.defer();
           $indexedDB.openStore(entity, function(store){
                var find = store.query();
                store.eachWhere(find).then(function(e){
                    deferred.resolve(e);
                });
           });

           return deferred.promise;
        },
        
        upsert: function(entity,obj) {
           var deferred = $q.defer();
           $indexedDB.openStore(entity, function(store){
                store.upsert(obj).then(function (e) {
                    deferred.resolve(e);
                });
           });

           return  deferred.promise;    
        },

        remove: function(entity,ids) {
            var deferred = $q.defer();
            $indexedDB.openStore(entity, function(store){
              for (var id in ids) {
                store.delete(parseInt(id)).then(function (e) {
                    deferred.resolve(e);
                });
              }  
           });

           return  deferred.promise;  
        },

        clear: function(entity) {
          var deferred = $q.defer();
          $indexedDB.openStore(entity, function(store){
              store.clear().then(function(){
                  deferred.resolve();
              });
          });

          return deferred.promise;
        }
  }      
});