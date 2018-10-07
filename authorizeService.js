const express = require('express');
const bodyParser = require('body-parser');
const log = require('simple-node-logger').createSimpleLogger();
const oauthserver = require('oauth2-server');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
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

/**
 * @swagger
 * definition:
 *   TokenResponse:
 *     required:
 *       - token_type
 *       - access_token
 *       - expires_in
 *     properties:
 *       token_type:
 *         type: string
 *         default: bearer
 *       access_token:
 *         type: string
 *         default: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbWFyaXMiLCJ1c2VybmFtZSI6IjAxNzg5MTRjLTU0OGItNGE0Yy1iOTE4LTQ3ZDZhMzkxNTMwYyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUzODkwNzI4MCwiaWF0IjoxNTM4OTAzNjc5fQ.PC_G5N9T9Jh9gd8JpUMZXNGRLOpEAyAk3Y3At97y6YI
 *       expires_in:
 *         type: integer
 *         default: 3600
 */

/**
 * @swagger
 * /oauth/token:
 *   post:
 *     tags:
 *       - Token management
 *     description: Generate OAuth2.0 JWT token
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: grant_type
 *         description: grant type
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: user email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: user password
 *         in: formData
 *         required: true
 *         type: string
 *       - name: client_id
 *         description: client id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: client_secret
 *         description: client secret
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Access token
 *         schema:
 *           $ref: '#/definitions/TokenResponse'
 */
api.all('/oauth/token', api.oauth.grant());
api.use(api.oauth.errorHandler());
api.use('/api-docs', express.static(path.join(__dirname, './swagger-ui')));

var server = api.listen(9998, '127.0.0.1', () => {
    var host = server.address().address;
    var port = server.address().port;

    log.info('Starting OAuth2.0 service listening on http://', host, ':', port);
});

var swaggerDefinition = {
    info: {
        title: 'OAuth2.0 Service API',
        version: '1.0.0',
        description: 'RESTful API with Swagger'
    },
    host: server.address + ':' + server.port,
    basePath: '/'
};

var swaggerSpec = swaggerJsdoc({
   swaggerDefinition: swaggerDefinition,
   apis: [path.basename(__filename)]
});

api.get('/swagger.json', function(request, response) {
    response.set('Content-Type', 'application/json');
    response.send(swaggerSpec);
});