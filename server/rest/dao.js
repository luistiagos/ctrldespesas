var MongoClient = require('mongodb').MongoClient;

Dao = function(db) {
  
  this.coll = db.collection('users');

  this.addUser = function(user,callback) {
    this.coll.insertOne(user, function(err, r) {
        if (err) throw err;
	callback(r.insertedCount);
    });
  };

  this.addMultiplyUsers = function(users,callback) {
    this.coll.insertMany(users, function(err, r) {
        if (err) throw err;
	callback(r.insertedCount);
    });
  };

  this.listUsers = function(user,callback) {
    this.coll.find(user).toArray(function(err,docs){
        if(err) throw err;
        callback(docs);
    });
  };

  this.removeUsers = function(user, callback) {
    this.coll.deleteMany(user,{},function(err,doc){
       if(err) throw err;
       callback(doc);
    });
  };

  this.upsert = function(user,no, callback) {
    this.coll.updateOne(user, {$set:no}, {upsert:true}, function(err, doc) {
       if(err) throw err;
        callback(doc);
    });
  };

  this.removeAttr = function(user,no, callback) {
    this.coll.updateOne(user, {$unset:no}, {upsert:true}, function(err, doc) {
       if(err) throw err;
        callback(doc);
    });
  };

  this.mapReduce = function(callback) {
    var map = function() {
       for (var i=0;i<this.itens.length;i++) {
          emit(this.itens[i].nome, {count:1, preco:this.itens[i].preco});
       }
    }; 

    var reduce = function(keyCustId, valuesPrices) {
       var valuePrice = {count:0, preco:0};
       for (var i=0;i<valuesPrices.length;i++) {
          valuePrice.count += valuesPrices[i].count;
 	  valuePrice.preco += valuesPrices[i].preco;
       }
       return valuePrice;
    };

    var finalizeFunction = function (key, reducedVal) {
      reducedVal.avg = reducedVal.preco/reducedVal.count;
      return reducedVal;
    };

    this.coll.mapReduce(map, reduce,{out: "map_reduce_example", verbose:false, finalize:finalizeFunction}, 
      function(err,collSaida,stats) {
	if(err) throw err;
         collSaida.find().toArray(function(err, results) {
           callback(results);
        });
      }
    );
  };
 
};

exports.Dao = Dao;


