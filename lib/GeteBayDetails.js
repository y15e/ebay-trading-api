/**
 * GeteBayDetails
 */
(function() {
  
  var async = require('async');
  var ebay = require('../index');
  var mongo = require('./mongo-connect');
  
  var methods = {
    
    call: function(params, callback) {
      
      var reqjson = {
        callname: 'GeteBayDetails',
        siteid: 0, // US
        data: {
          RequesterCredentials: {
            eBayAuthToken: params.authToken
          }
        }
      };
          
      async.waterfall([
        
        function(callback) {
          // Call US at first to get siteid list
          ebay.call(reqjson, callback);
        },
        
        function(result, callback) {
          
          var siteDetails = result.GeteBayDetailsResponse.SiteDetails;
          
          // Call for each 21 eBay site. (US, UK, etc)
          async.each(siteDetails, function(siteDetail, callback) {
            
            reqjson.siteid = siteDetail.SiteID;
            
            ebay.call(reqjson, function(err, result) {
              
              methods.insertMongo(siteDetail.Site,
                                  result.GeteBayDetailsResponse,
                                  callback);
            }); // call
          }, callback); // async.each
        }
      ], callback); // async.waterfall
    }, // call
    
    insertMongo: function(site, data, callback) {
      mongo(function(db) {
        db.collection(site + '.eBayDetails', function(err, coll) {
          coll.remove({}, function(err, result) {
            coll.insert(data, callback);
          });
        });
      });
    } // insertMongo
    
  }; // methods
  
  module.exports = methods;
  
}).call(this);
