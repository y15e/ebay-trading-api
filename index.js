/**
 * A node client for eBay Trading API.
 */

// Module dependencies
var async = require('async');
var https = require('https');
var js2xmlparser = require('js2xmlparser');
var moment = require('moment');
var xml2js = require('xml2js');

// "Don't use more than 18 simultaneous threads to make API calls."
// https://go.developer.ebay.com/developers/ebay/forums-support/certification
var concurrency = 5;

// Queue object.
var queue = async.queue(function(task, callback) {
  
  // call eBay Trading API
  var req = https.request(task.options, function(res) {
    
    res.setEncoding('utf8');
    
    var result = '';
    
    res.on('data', function (chunk) {
      result += chunk;
    });
    
    res.on('end', function (chunk) {
      callback(null, result);
    });
    
  });
  
  req.on('error', function(e) {
    console.dir(e);
  });
  
  req.write(task.data);
  
  req.end();
  
}, concurrency);

var methods = {
  
  call: function(requestjson, callback) {
    
    var task = {
      options: methods.createOptionsFromJson(requestjson),
      data: methods.convertJsonToXml(requestjson)
    };
    
    queue.push(task, function(err, result) {
      methods.convertXmlToJson(result, callback);
      methods.logTaskCount();
    });
    
  },
  
  createOptionsFromJson: function(json) {
    
    var config = require('../../config');
    
    var options = {
      hostname: config.apihost,
      port: 443,
      path: config.apipath,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'X-EBAY-API-COMPATIBILITY-LEVEL': config.compatlevel,
        'X-EBAY-API-CALL-NAME': json.callname,
        'X-EBAY-API-SITEID':    json.siteid,
        'X-EBAY-API-DEV-NAME':  config.devname,
        'X-EBAY-API-APP-NAME':  config.appname,
        'X-EBAY-API-CERT-NAME': config.certname
      }
    };
    
    return options;
  },
  
  convertJsonToXml: function(json, callback) {
    
    var xml = js2xmlparser(json.callname, json.params);
    
    xml = xml.replace
    ('<' + json.callname + '>', 
     '<' + json.callname + ' xmlns="urn:ebay:apis:eBLBaseComponents">');
    
    return xml;
  },
  
  convertXmlToJson: function(xml, callback) {
    
    var parser = xml2js.Parser({
      attrkey: '@',
      charkey: '#text',
      explicitArray: false
    });
    
    parser.parseString(xml, callback);
  },
  
  logTaskCount: function() {
    
    var now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    
    console.log(now + ' task: ' + queue.length() + ' -> ' + queue.running());
  }
  
};

module.exports = methods;
