var ebay = require('../index');
var conf = require('./config');

var params = {
  callname: 'GeteBayDetails',
  siteid: 0,
  data: {
    RequesterCredentials: {
      eBayAuthToken: conf.eBayAuthToken
    }
  }
}

ebay.call(params, function(err, result) {
  console.dir(result);
});
