// alexa-cookbook sample code

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
//  or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.


// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function
'use strict';

// 2. Skill Code =======================================================================================================

var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    alexa.appId = 'amzn1.ask.skill.[]';
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Welcome to the open hours, You can say Issaquah Costco Or Gilman QFC', 'Or 2641 Plymouth Kroger');
    },

    'GetLocationIntent': function () {
        var myRequest = "";
        if (typeof this.event.request.intent.slots.City.value !== 'undefined' 
            && this.event.request.intent.slots.City.value) {
            myRequest += this.event.request.intent.slots.City.value + " ";
        }

        if (typeof this.event.request.intent.slots.Street.value !== 'undefined' 
            && this.event.request.intent.slots.Street.value) {
            myRequest += this.event.request.intent.slots.Street.value + " ";
        }

        if (typeof this.event.request.intent.slots.Business.value !== 'undefined' 
            && this.event.request.intent.slots.Business.value) {
            myRequest += this.event.request.intent.slots.Business.value;
        }

        myRequest = myRequest.trim();
        httpsGet(myRequest,  myResult => {
                console.log("sent     : " + myRequest);
                console.log("callback : " + myResult);

                var output;

                if (myResult === "") {
                    output = "Your request open hours for " + myRequest + " returns no precise hit. Try again";
                } else {
                    output = "Your request open hours for " + myRequest + ' is ' + myResult;
                }

                this.emit(':tellWithCard', output, "Opening hours", output);
            }
        );
    },

    'AMAZON.SearchAction<object@LocalBusiness[openHours]>': function () {  
        // The available Intent Handlers from LocalBusiness[openHours] include:
        // object.location.addressLocality.name
        // object.spatialRelation
        // object.location.name
        // object.openHours.closes
        // object.type
        // object.name
        // object.location.streetAddress.name

        var myRequest = "";
        if (typeof this.event.request.intent.slots["object.location.addressLocality.name"] !== 'undefined') {
            if (typeof this.event.request.intent.slots["object.location.addressLocality.name"].value !== 'undefined') {
                myRequest += this.event.request.intent.slots["object.location.addressLocality.name"].value + " ";
            }
        }             

        if (typeof this.event.request.intent.slots["object.location.name"] !== 'undefined') {
            if(typeof this.event.request.intent.slots["object.location.name"].value !== 'undefined') {
                myRequest += this.event.request.intent.slots["object.location.name"].value + " ";
            }
        }

        if (typeof this.event.request.intent.slots["object.location.streetAddress.name"] !== 'undefined') {
            if(typeof this.event.request.intent.slots["object.location.streetAddress.name"].value !== 'undefined') {
                myRequest += this.event.request.intent.slots["object.location.streetAddress.name"].value + " ";
            }
        }

        if (typeof this.event.request.intent.slots["object.type"] !== 'undefined'){
            if(typeof this.event.request.intent.slots["object.type"].value !== 'undefined') {
                myRequest += this.event.request.intent.slots["object.type"].value + " ";
            }
        }

        if (typeof this.event.request.intent.slots["object.name"] !== 'undefined') { 
            if(typeof this.event.request.intent.slots["object.name"].value !== 'undefined') {
                myRequest += this.event.request.intent.slots["object.name"].value;
            }
        }

        myRequest = myRequest.trim();
        httpsGet(myRequest,  myResult => {
                console.log("sent     : " + myRequest);
                console.log("callback : " + myResult);

                var output;

                if (myResult === "") {
                    output = "Your request open hours for " + myRequest + " returns no precise hit. Try again";
                } else {
                    output = "Your request open hours for " + myRequest + ' is ' + myResult;
                }

                this.emit(':tellWithCard', output, "Opening hours", output);
            }
        );
    }
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

var cheerio = require('cheerio');
var request = require('request');
var util = require('util');
var querystring = require('querystring');

function httpsGet(query, callback) {
    var startIndex = 0;
    var resultsNumber = 1;

    var openHours = '#vBb,._m3b';
    var shopName = '._eGc';

    var URL = 'https://www.google.com/search?&q=%s+open+hours&start=0&num=1';
    var newUrl = util.format(URL, querystring.escape(query.trim()));
    
    // GET is a web service request that is fully defined by a URL string
    var requestOptions = {
        url: newUrl,
        method: 'GET'
      };

    request(requestOptions, function (err, res, body) {
        if ((err === null) && res.statusCode === 200) {
            var $ = cheerio.load(body);

            var Str = $(openHours).text();

            console.log('openhours:', Str);
            console.log('shopName:', $(shopName).text());

            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            callback(Str);
        } else {
            console.error(err);
        }
  });
   
}