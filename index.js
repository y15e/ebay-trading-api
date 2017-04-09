/**
 * Node client for eBay Trading API.
 */

(function() {
  
  // Module dependencies
  var async = require('async');
  var https = require('https');
  var js2xmlparser = require('js2xmlparser');
  var moment = require('moment');
  var xml2js = require('xml2js');
  
  // "Don't use more than 18 simultaneous threads to make API calls."
  // https://go.developer.ebay.com/developers/ebay/forums-support/certification
  var concurrency = 5;
  
  // eBay API environment
  var env = require('./env');
  
  // Application keys
  var appkeys = require('./appkeys');
  
  // Queue object
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
    
    // handle errors
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    
    // task.data is xml format
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
    
    callApi: function(requestjson, callback) {
      
      var apiModule = require('./lib/' + requestjson.callname);
      
      apiModule.call(requestjson, callback);
      
    },
    
    createOptionsFromJson: function(json) {
      
      var options = {
        hostname: env.host,
        port: env.port,
        path: env.path,
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'X-EBAY-API-COMPATIBILITY-LEVEL': env.compatlevel,
          'X-EBAY-API-CALL-NAME': json.callname,
          'X-EBAY-API-SITEID':    json.siteid,
          'X-EBAY-API-DEV-NAME':  appkeys.devname,
          'X-EBAY-API-APP-NAME':  appkeys.appname,
          'X-EBAY-API-CERT-NAME': appkeys.certname
        }
      };
      
      return options;
    },
    
    convertJsonToXml: function(json) {
      
      var xml = js2xmlparser.parse(json.callname, json.data, {
        declaration: { encoding: 'UTF-8' }
      });
      
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
  
}).call(this);
