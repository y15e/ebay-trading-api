/**
 * GetCategorySpecifics
 */
(function() {
  
  var async = require('async');
  var ebay = require('../index');
  var mongo = require('./mongo-connect');
  
  var methods = {
    
    call: function(params, callback) {
      
      async.waterfall([
        
        // Get siteid list (US, UK, etc)
        function(callback) {
          mongo(function(db) {
            db.collection('US.eBayDetails', function(err, coll) {
              coll.findOne({}, function(err, doc) {
                callback(null, doc.SiteDetails);
              });
            });
          });
        },
        
        function(siteDetails, callback) {
          
          // Call for each 21 eBay site. (US, UK, etc)
          async.each(siteDetails, function(siteDetail, callback) {
            
            var reqjson = {
              callname: 'GetCategorySpecifics',
              siteid: siteDetail.SiteID,
              data: {
                CategorySpecificsFileInfo: 'true',
                WarningLevel: 'High',
                DetailLevel: 'ReturnAll',
                RequesterCredentials: {
                  eBayAuthToken: params.authToken
                }
              }
            };
            
            ebay.call(reqjson, function(err, result) {
              
              var res = result.GetCategorySpecificsResponse;
              var taskId = res.TaskReferenceID;
              var fileId = res.FileReferenceID;
              
            }); // call
          }, callback); // async.each
          
        }
        
      ], callback); // async.waterfall
      
    } // call
    
  }; // methods
  
  module.exports = methods;
  
}).call(this);
