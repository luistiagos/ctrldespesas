var cors = require('cors');
var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var _ = require('lodash');
//var MongoClient = require('mongodb').MongoClient;
var app = express();
var iconvlite = require('iconv-lite');
var babyparse = require('babyparse');
var multer  =   require('multer');
//var Dao = require('./dao').Dao;
var dao = undefined;

var upload = multer({ dest: 'uploads/' });
var RestClient = require('node-rest-client').Client; 
var rclient = new RestClient();

var byline = require('byline');

var readline = require('readline');

var apiKey = 'tqiAxDRIsNok9xYG0ldq0B6RD1b9tUJw';


 var descCateg = [];

app.use(cors());

app.post('/addUser', bodyParser.json(), function (req, res) {
   dao.addUser(req.body, function(doc){
       res.end(JSON.stringify(doc));
   });
});

app.post('/addMultipleUsers', bodyParser.json(), function (req, res) {
   dao.addMultiplyUsers(req.body, function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/listUsers', bodyParser.json(), function (req, res) {
   dao.listUsers(req.body, function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/removeUsers', bodyParser.json(), function (req, res) {
   dao.removeUsers(function(docs){
       res.end(docs);
   });
});

app.get('/getByName:nome', function (req, res) {
   dao.listUsers({nome:req.params.nome}, function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/upsert', bodyParser.json(), function (req, res) {
   dao.upsert(req.body.find,req.body.upsert,function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.post('/removeAttr', bodyParser.json(), function (req, res) {
   dao.removeAttr(req.body.find,req.body.upsert,function(docs){
       res.end(JSON.stringify(docs));
   });
});

app.get('/mapReduce', function (req, res) {
   dao.mapReduce(function(docs){
       res.end(JSON.stringify(docs));
   });
});

var getTipo = function(tipo) {
  if (tipo.indexOf('Saque') > -1 || tipo.indexOf('Banco 24') > -1) {
    return 'SAQUE';
  }

  if (tipo.indexOf('Compra') > -1) {
    return 'COMPRA';
  }

  if (tipo.indexOf('cartão crédito') > -1) {
    return 'CREDICARD';
  }
  
  return tipo;
};

var getGastos = function(callback) {
    rclient.get("https://api.mlab.com/api/1/databases/controlegastos/collections/gastos?apiKey="+apiKey, 
      function (data) {
        callback(data);
   });
};

var getMapaDescCateg = function(callback) {
    if (descCateg.length > 0) {
       callback(descCateg);
    }
    else {
      rclient.get("https://api.mlab.com/api/1/databases/controlegastos/collections/descCateg?apiKey="+apiKey, 
        function (descCategs) {
          for (var index in descCategs) {
            descCateg[descCategs[index].descricao] = descCategs[index];
          }
          callback(descCateg);
      });
    } 
};

var atualizarDescCateg = function(desc,categ) { 
    var args = {
          data: JSON.stringify( { "$set" : {categoria:categ} } ),
          headers: { "Content-Type": "application/json" }
    };

    rclient.put("https://api.mlab.com/api/1/databases/controlegastos/collections/descCateg?apiKey="+apiKey+
      "&q="+JSON.stringify({descricao:desc}), 
      args, function (data) {
        descCateg[desc] = {descricao:desc,categoria:categ};
    });
};

var salvarDescCateg = function(desc,categ) { 
    var args = {
          data: JSON.stringify({descricao:desc,categoria:categ}),
          headers: { "Content-Type": "application/json" }
    };
    rclient.post("https://api.mlab.com/api/1/databases/controlegastos/collections/descCateg?apiKey="+apiKey, 
      args, function (data) {
        descCateg[desc] = {descricao:desc,categoria:categ};
    });
};

var salvarGastos = function(itens,callback) {
    var args = {
          data: JSON.stringify(itens),
          headers: { "Content-Type": "application/json" }
    };
    rclient.post("https://api.mlab.com/api/1/databases/controlegastos/collections/gastos?apiKey="+apiKey, 
      args, function (data) {
        callback(data);
    });
};

var atualizarGasto = function(item) {  
    var args = {
          data: JSON.stringify( { "$set" : item } ),
          headers: { "Content-Type": "application/json" }
    };

    rclient.put("https://api.mlab.com/api/1/databases/controlegastos/collections/gastos?apiKey="+apiKey+
      "&q="+JSON.stringify({id:item.id}), 
      args, function (data) {
        console.log(data);
    });
};

app.post('/atualizarMapaDescricaoCategoria', bodyParser.json(), function (req, res) {
   if (!descCateg[req.body.descricao]) {
      salvarDescCateg(req.body.descricao,req.body.categoria);
   }
   else {
      atualizarDescCateg(req.body.descricao,req.body.categoria);
   }
});

app.post('/atualizarGasto', bodyParser.json(), function (req, res) {
    atualizarGasto(req.body);
});

app.post('/upload', upload.single('file'), function (req, res) {
   var data = [];
   console.log(req.file);
   var readerStream = fs.createReadStream(req.file.path);
   readerStream.on('data', function(chunk) {
   	data.push(chunk);
   }).on('end',function(){
        var decodedBody = iconvlite.decode(Buffer.concat(data), 'ISO-8859-9');
      	var doc = babyparse.parse(decodedBody);	
      	var anoAtual = new Date().getFullYear();
        var arrItens = [];

        getMapaDescCateg(function(mapDesCateg){
           _.forEach(doc.data,function(item){
             if (item.length == 7 && item[2]) {
                var tipo = undefined;
                var descricao = undefined;
                var data = undefined;
                var valor = parseFloat(item[5]);

                if (valor < 0) {
                    if(item[2].indexOf(' - ') > 1) {
                       var arrItem = item[2].split(' - ');  
                       var parsedStr = arrItem[1].trim();  
                       var arrObj = parsedStr.split(' ');
                       
                       var arrDate = arrObj[0].trim().split('/');
                       var arrHour = arrObj[1].trim().split(':');
                       tipo = arrItem[0].trim();
                       descricao = '';
                       for (var i=2;i<arrObj.length;i++) {
                          descricao += arrObj[i];
                          if (i<arrObj.length-1) {
                            descricao += ' ';
                          }
                       }
                       data = new Date(anoAtual,arrDate[1]-1,arrDate[0],arrHour[0],arrHour[1],0,0);
                    }
                    else {
                       tipo = item[2];
                       descricao = tipo;
                       arrDate = item[0].trim().split('/');
                       data = new Date(anoAtual,arrDate[0]-1,arrDate[1],1,0,0,0);
                    }

                    var itemContb = {
                      id:undefined,
                      data:data,
                      tipo:tipo,        
                      descricao:descricao,
                      valor:valor
                    };

                    if (mapDesCateg[descricao]) {
                      itemContb.categoria = mapDesCateg[descricao].categoria;
                    }

                    itemContb.tipo = getTipo(itemContb.tipo); 
                    itemContb.id = ((itemContb.data.getTime() / 1000) + 
                      (itemContb.valor.toString().replace('.',''))).replace('-','');    
                    console.log(itemContb);
                    arrItens.push(itemContb);
                } 
             }       
          }); 
        
          getGastos(function(itens){
              var pushItens = [];
              var mapItens = [];
              if (!itens || itens.length == 0) {
                pushItens = arrItens;
              }
              else {
                for (var i=0;i<itens.length;i++) {
                   mapItens[itens[i].id] = itens[i]; 
                }
                for (var i=0;i<arrItens.length;i++) {
                   if(!mapItens[arrItens[i].id]) {
                      pushItens.push(arrItens[i]);
                   } 
                }
              }

              if (pushItens.length > 0) {
                  salvarGastos(pushItens,function(data){
                    fs.unlinkSync(req.file.path);
                    res.end("");
                  });
              }
              else {
                 fs.unlinkSync(req.file.path);
                 res.end("");
              }
          }); 

        });

      	

    }).on('error', function(err){
        console.log(err.stack);
      	res.end('Ocorreu um erro inesperado.');
    });
});

app.get('/gastos', function (req, res) {
  getGastos(function(data){
    res.end(JSON.stringify(data));
  });
});

var processaLinhaTxt = function(linha) {
   if (linha && linha.trim().length > 0) {
      var strDate = linha.substring(0,6).trim();
      var strValor = linha.substring(60,69).trim().replace(',','.');
      if (strDate.indexOf('/') > -1 && strValor && parseFloat(strValor) != NaN) {
        var anoAtual = new Date().getFullYear();
        var item = {};
        var arrDate = strDate.split('/');
        item.data = new Date(anoAtual,arrDate[1]-1,arrDate[0],0,0,0,0);
        item.descricao = linha.substring(9,48).trim();
        item.valor = parseFloat(strValor);
        item.valorUSS = parseFloat(linha.substring(71,81).trim().replace(',','.'));
        return item;
      }
   }
   return undefined;
};

app.post('/uploadCrediCard', upload.single('file'), function (req, res) {
   var data = [];
   var listItens = [];
   var cotacao = 1;
   var startLine = 50;
   var endLine = -1;

   readline.createInterface({
       input: fs.createReadStream(req.file.path)
   }).on('line', function (line) {
      data.push(line);
   }).on('close',function(){
      for (var i=0;i<data.length;i++) {
        if (i >= startLine) {
          if (data[i]) {
            if(endLine < 0) {
              if (data[i].indexOf("SubTotal") > -1) {
                 endLine = i;
                 continue;
              }
              
              var item = processaLinhaTxt(data[i]);
              if (item) {
                listItens.push(item);
              }
              
            }
            else if(data[i].indexOf("Taxa de") > -1) {
                cotacao = parseFloat(data[i+3].substring(54,64).trim().replace(',','.'));
                console.log(cotacao);
                break;
            } 
          }
        }
      }

      var soma = 0;

      for (var i in listItens) {
         var item = listItens[i];
         if (item && item.valorUSS && item.valorUSS > 0) {
            item.valor = item.valorUSS * cotacao;
         }

         
         soma += item.valor;
      }

      console.log('total:'+soma);

   });
});

var server = app.listen(8181, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("app listening at http://%s:%s", host, port)

})
