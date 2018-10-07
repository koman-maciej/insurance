const express = require('express');
const bodyParser = require('body-parser');
const log = require('simple-node-logger').createSimpleLogger();
const oauthserver = require('oauth2-server');
const inMemoryOAuthModel = require('./oAuthModel.js');

var api = express();

api.use(bodyParser.urlencoded({
    extended: true
}));
api.use(bodyParser.json());

api.oauth = oauthserver({
    model: inMemoryOAuthModel,
    grants: ['password'],
    debug: true,
    accessTokenLifetime: inMemoryOAuthModel.JWT_ACCESS_TOKEN_EXPIRY_SECONDS,
});

api.all('/oauth/token', api.oauth.grant());
api.use(api.oauth.errorHandler());

var server = api.listen(9998, '127.0.0.1', () => {
    var host = server.address().address;
    var port = server.address().port;

    log.info('Starting OAuth2.0 service listening on http://', host, ':', port);
});