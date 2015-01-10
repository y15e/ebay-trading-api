/**
 * GetCategoryFeatures
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
              callname: 'GetCategoryFeatures',
              siteid: siteDetail.SiteID,
              data: {
                ViewAllNodes: 'true',
                WarningLevel: 'High',
                DetailLevel: 'ReturnAll',
                RequesterCredentials: {
                  eBayAuthToken: params.authToken
                }
              }
            };
            
            ebay.call(reqjson, function(err, result) {
              
              var data = result.GetCategoryFeaturesResponse;
              
              // todo: Should I convert attributes here?
              
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
        
        async.series([
          
          // ex: US.CategoryFeatures.Category
          function(callback) {
            var collname = site + '.CategoryFeatures.Category';
            db.collection(collname, function(err, coll) {
              coll.remove({}, function() {
                coll.insert(data.Category, callback);
              })
            });
          },
          
          // ex: US.CategoryFeatures
          function(callback) {
            
            delete data.Category; // delete category list
            
            var collname = site + '.CategoryFeatures';
            db.collection(collname, function(err, coll) {
              coll.remove({}, function() {
                coll.insert(data, callback);
              })
            });
          }
          
        ], callback); // async.series
        
      });
    } // insertMongo
    
  }; // methods
  
  module.exports = methods;
  
}).call(this);
