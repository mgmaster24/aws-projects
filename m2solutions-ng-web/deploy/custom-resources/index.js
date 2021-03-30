'use strict';
var Lulo = require('lulo');
var lulo = Lulo({ logEvents: true, logResponse: true })
  .register('Route53RecordSetAPIGatewayRegionalDomain', require('./lulo-plugins/route53-record-set-api-gateway-regional-domain'));

exports.handler = function (event, context, callback) {
  lulo.handler(event, context, callback);
};
