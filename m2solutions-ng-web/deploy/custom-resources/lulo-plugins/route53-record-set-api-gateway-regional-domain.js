'use strict';

var aws = require('aws-sdk');
var apiGateway = new aws.APIGateway({
    apiVersion: '2015-07-09'
});
var route53 = new aws.Route53({
    apiVersion: '2013-04-01'
})

var pub = {};

pub.validate = function (event) {
    if (!event.ResourceProperties.DomainName) {
        throw new Error('Missing required property DomainName');
    }
    if (!event.ResourceProperties.HostedZoneId) {
        throw new Error('Missing required property HostedZoneId');
    }
};

pub.create = function (event, _context, callback) {
    try {
        delete event.ResourceProperties.ServiceToken;
        console.log(event);
        var params = {
            domainName: event.ResourceProperties.DomainName
        };
        apiGateway.getDomainName(params, function (error, response) {
            if (error) {
                return callback(error);
            }

            var route53Params = {
                ChangeBatch: {
                    Changes: [{
                        Action: "CREATE",
                        ResourceRecordSet: {
                            Name: event.ResourceProperties.DomainName,
                            ResourceRecords: [{
                                Value: response.regionalDomainName
                            }],
                            TTL: 300,
                            Type: "CNAME"
                        }
                    }],
                },
                HostedZoneId: event.ResourceProperties.HostedZoneId
            };
            route53.changeResourceRecordSets(route53Params, function (err, data) {
                console.log("Calling Rout53 with:")
                console.log(route53Params)
                console.log("Changes")
                console.log(route53Params.ChangeBatch.Changes);
                console.log("Records")
                console.log(route53Params.ChangeBatch.Changes[0].ResourceRecordSet.ResourceRecords);
                if (error) {
                    console.log("ERROR");
                    console.log(error);
                    return callback(error);
                } 
                if (error) {
                    return callback(error);
                } 
                
                console.log("Success!! Data is: ");
                console.log(data);
                callback(null, {});
            });
        });
    } catch (e) {
        callback(e);
    }
};

pub.update = function (event, _context, callback) {
    try {
        delete event.ResourceProperties.ServiceToken;
        var params = {
            domainName: event.ResourceProperties.DomainName
        };
        apiGateway.getDomainName(params, function (error, response) {
            if (error) {
                return callback(error);
            }

            var route53Params = {
                ChangeBatch: {
                    Changes: [{
                        Action: "UPSERT", // this is not a typo
                        ResourceRecordSet: {
                            Name: event.ResourceProperties.DomainName,
                            ResourceRecords: [{
                                Value: response.regionalDomainName
                            }],
                            TTL: 300,
                            Type: "CNAME"
                        }
                    }],
                },
                HostedZoneId: event.ResourceProperties.HostedZoneId
            };
            route53.changeResourceRecordSets(route53Params, function (err, data) {
                console.log("Calling Rout53 with:")
                console.log(route53Params)
                console.log("Changes")
                console.log(route53Params.ChangeBatch.Changes);
                if (error) {
                    console.log("ERROR");
                    console.log(error);
                    return callback(error);
                } 
                if (error) {
                    return callback(error);
                } 

                callback(null, {});
            });
        });
    } catch (e) {
        callback(e);
    }
};

pub.delete = function (event, _context, callback) {
    try {
        delete event.ResourceProperties.ServiceToken;
        var params = {
            domainName: event.ResourceProperties.DomainName
        };
        apiGateway.getDomainName(params, function (error, response) {
            if (error) {
                return callback(error);
            }

            var route53Params = {
                ChangeBatch: {
                    Changes: [{
                        Action: "DELETE",
                        // For some reason, all of the following are required to delete the route entry
                        ResourceRecordSet: {
                            Name: event.ResourceProperties.DomainName,
                            ResourceRecords: [{
                                Value: response.regionalDomainName
                            }],
                            TTL: 300,
                            Type: "CNAME"
                        }
                    }],
                },
                HostedZoneId: event.ResourceProperties.HostedZoneId
            };
            route53.changeResourceRecordSets(route53Params, function (err, data) {
                if (error) {
                    return callback(error);
                } 

                callback(null, {});
            });
        });
    } catch (e) {
        callback(e);
    }
};

module.exports = pub;
