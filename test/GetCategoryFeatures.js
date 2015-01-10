var ebay = require('../index');
var conf = require('./config');

var params = {
  callname: 'GetCategoryFeatures',
  authToken: conf.eBayAuthToken
}

ebay.callApi(params, function(err, result) {
});
