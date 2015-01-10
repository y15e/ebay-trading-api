/**
 * GetCategories
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
              callname: 'GetCategories',
              siteid: siteDetail.SiteID,
              data: {
                CategorySiteID: siteDetail.SiteID,
                WarningLevel: 'High',
                DetailLevel: 'ReturnAll',
                RequesterCredentials: {
                  eBayAuthToken: params.authToken
                }
              }
            };
            
            ebay.call(reqjson, function(err, result) {
              
              var data = result.GetCategoriesResponse.CategoryArray.Category;
              
              methods.insertMongo(siteDetail.Site,
                                  data,
                                  callback);
            }); // call
          }, callback); // async.each
          
        }
        
      ], callback); // async.waterfall
      
    }, // call
    
    insertMongo: function(site, data, callback) {
      mongo(function(db) {
        db.collection(site + '.Categories', function(err, coll) {
          coll.remove({}, function(err, result) {
            coll.insert(data, callback);
          });
        });
      });
    } // insertMongo
    
  }; // methods
  
  module.exports = methods;
  
}).call(this);
