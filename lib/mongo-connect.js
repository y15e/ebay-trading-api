(function() {
  
  var MongoClient = require('mongodb').MongoClient;
  
  module.exports = function(callback) {
    
    var url = 'mongodb://localhost:27017/ebay-sandbox';
    
    MongoClient.connect(url, function(err, db) {
      callback(db);
    });
    
  }
  
}).call(this);
