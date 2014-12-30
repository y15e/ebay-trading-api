ebay-api
========

A node client for eBay Trading API.

## Installation

  npm install ebay-api

## Example
```
var ebay = require('ebay-api');

// Input parameters for GetItem api call.
// params.data is converted to xml format in the call method.
// http://developer.ebay.com/DevZone/xml/docs/Reference/ebay/GetItem.html
var params = {
  callname: 'GetItem',
  siteid: 0,
  data: {
    RequesterCredentials: {
      eBayAuthToken: 'your-token-string'
    },
    ItemID: 'item-id'
  }
};
  
ebay.call(params, function(err, result) {
  console.dir(result);
});
```
