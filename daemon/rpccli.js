#!/usr/bin/env node

var util = require('util');

var logger = require('../lib/logger');
var getConfig = require('./init').getConfig;

var cfg = getConfig();

if (cfg.jsonrpc.password == null) {
  logger.error('No JSON RPC password specified in configuration.');
  logger.notice('Note that you can use the --rpcpassword command line parameter.');
  process.exit(1);
}

var RpcClient = require('jsonrpc2').Client;

var rpc = new RpcClient(cfg.jsonrpc.port, cfg.jsonrpc.host,
                        cfg.jsonrpc.username, cfg.jsonrpc.password);

if (process.argv.length < 3) {
  logger.error("No RPC method specified!");
  console.log("Usage: node daemon/cli.js <rpcmethod> [rpcparam1 rpcparam2 ...]");
  process.exit(1);
}

var params = process.argv.slice(3).map(function (param) {
  var value;
  try {
    value = JSON.parse(param);
  } catch (e) {
    value = param;
  }
  return value;
});

rpc.call(process.argv[2], params, function (err, result) {
  if (err) {
    logger.error("RPC Error: "+
                 (err.stack ? err.stack : util.inspect(err)));
    process.exit(1);
  }
  util.puts(util.inspect(result, false, null));
});
