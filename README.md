ebay-trading-api
================

A node client for eBay Trading API.

## Installation

npm install ebay-trading-api

## Configuration

Copy **env.js.production** or **env.js.sandbox** to **env.js**.

If you use *GetSessionID*, *FetchToken*, *GetTokenStatus* or *RevokeToken*, copy **appkeys.js.sample** to **appkeys.js** and update devname, appname and certname in appKeys object.

## Example
```
var ebay = require('ebay-trading-api');

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

## Test

npm test
