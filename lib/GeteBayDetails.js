(function() {
  
  var async = require('async');
  var ebay = require('../index');
  var mongo = require('./mongo-connect');
  
  var methods = {
    
    call: function(params, callback) {
      
      var reqjson = {
        callname: 'GeteBayDetails',
        siteid: 0,
        data: {
          RequesterCredentials: {
            eBayAuthToken: params.authToken
          }
        }
      };
          
      async.waterfall([
        
        function(callback) {
          ebay.call(reqjson, callback);
        },
        
        function(resjson1, callback) {
          
          var siteDetails = resjson1.GeteBayDetailsResponse.SiteDetails;
          
          async.each(siteDetails, function(siteDetail, callback) {
            
            reqjson.siteid = siteDetail.SiteID;
            
            ebay.call(reqjson, function(err, resultjson2) {
              
              var collname = siteDetail.Site + '.eBayDetails';
              
              mongo(function(db) {
                db.collection(collname, function(err, collection) {
                  collection.remove({}, function(err, result) {
                    collection.insert(resultjson2.GeteBayDetailsResponse, function(err, result) {
                      console.log('done: ' + siteDetail.Site);
                      callback();
                    });
                  });
                });
              });
              
            }); // call
            
          }, callback); // async.each
          
        }
        
      ], function(err, result) {
        
        console.log('DONE.');
        callback(err, result);
        
      }); // async.waterfall
      
    } // call
    
  }; // methods
  
  module.exports = methods;
  
}).call(this);
