const express = require('express');
const request = require('request-promise');
const log = require('simple-node-logger').createSimpleLogger();
const oauthserver = require('oauth2-server');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const inMemoryOAuthModel = require('./oAuthModel.js');

const api = express();

const getPoliciesRequestUri = 'http://www.mocky.io/v2/580891a4100000e8242b75c5';
const getUsersRequestUri = 'http://localhost:8001/rest/internal/users';

api.oauth = oauthserver({
    model: inMemoryOAuthModel
});
api.use(api.oauth.errorHandler());
api.use('/api-docs', express.static(path.join(__dirname, './swagger-ui')));

/**
 * @swagger
 * definition:
 *   UserResponse:
 *     required:
 *       - id
 *       - name
 *       - email
 *       - role
 *     properties:
 *       id:
 *         type: string
 *         default: e8fd159b-57c4-4d36-9bd7-a59ca13057bb
 *       name:
 *         type: string
 *         default: Manning
 *       email:
 *         type: string
 *         default: manningblankenship@quotezart.com
 *       role:
 *         type: string
 *         default: admin
 *   PolicyResponse:
 *     required:
 *       - id
 *       - amountInsured
 *       - email
 *       - inceptionDate
 *       - installmentPayment
 *       - clientId
 *     properties:
 *       id:
 *         type: string
 *         default: 7b624ed3-00d5-4c1b-9ab8-c265067ef58b
 *       amountInsured:
 *         type: float
 *         default: 399.89
 *       email:
 *         type: string
 *         default: inesblankenship@quotezart.com
 *       inceptionDate:
 *         type: string
 *         default: 2015-07-06T06:55:49Z
 *       installmentPayment:
 *         type: boolean
 *         default: true
 *       clientId:
 *         type: string
 *         default: a0ece5db-cd14-4f21-812f-966633e7be86
 */

/**
 * @swagger
 * /rest/policies:
 *   get:
 *     tags:
 *       - Policy management
 *     description: Get policies by userName
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userName
 *         description: user name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Policies
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/PolicyResponse'
 */
api.get('/rest/policies', api.oauth.authorise(), (req, res) => {
    const requesterRole = req.user.role;
    const userName = req.query.userName;
    log.info('Handling get policies by userName: [', userName, ']');

    if (requesterRole != inMemoryOAuthModel.JWT_ACCESS_TOKEN_ADMIN_ROLE) {
        res.statusCode = 401;
        res.end();
        return log.info('Request with role: [', requesterRole, '] unauthorized');
    }

    if (!userName) {
        res.statusCode = 400;
        res.end();
        return log.info('Bad request on missing parameter [userName]');
    }

    return getPoliciesByUserName(userName, res);
});

/**
 * @swagger
 * /rest/policies/{policyId}/user:
 *   get:
 *     tags:
 *       - Policy management
 *     description: Get user by policyId
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: policyId
 *         description: policy id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User
 *         schema:
 *           $ref: '#/definitions/UserResponse'
 */
api.get('/rest/policies/:policyId/user', api.oauth.authorise(), (req, res) => {
    const requesterRole = req.user.role;
    const policyId = req.params.policyId;
    log.info('Handling get user by policyId: [', policyId, ']');

    if (requesterRole != inMemoryOAuthModel.JWT_ACCESS_TOKEN_ADMIN_ROLE) {
        res.statusCode = 401;
        res.end();
        return log.info('Request with role: [', requesterRole, '] unauthorized');
    }

    return getUserByPolicyId(policyId, res);
});



var getPoliciesByUserName = (userName, res) => {
    request({
            method: 'GET',
            uri: getUsersRequestUri,
            qs: {
                name: userName
            },
            json: true
        })
        .then((userResponse) => {
            request({
                    method: 'GET',
                    uri: getPoliciesRequestUri,
                    json: true
                })
                .then((policiesResponse) => {
                    var response = {
                        policies: []
                    };
                    for (var i = 0, len = policiesResponse.policies.length; i < len; ++i) {
                        if (userResponse.id == policiesResponse.policies[i].clientId) {
                            response.policies.push(policiesResponse.policies[i]);
                        }
                    }

                    res.set('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                    return log.debug('Policies for userName: [', userName, '] fetched');
                })
                .catch((err) => {
                    res.statusCode = 500;
                    res.end();
                    return log.error('Internal server error: ', err);
                });
        })
        .catch((err) => {
            if (404 == err.statusCode) {
                res.statusCode = 404;
                res.end();
                return log.info('User with name: [', userName, '] not found');
            }

            res.statusCode = 500;
            res.end();
            return log.error('Internal server error: ', err);
        });
};

var getUserByPolicyId = (policyId, res) => {

    request({
            method: 'GET',
            uri: getPoliciesRequestUri,
            json: true
        })
        .then((policiesResponse) => {
            for (var i = 0, len = policiesResponse.policies.length; i < len; ++i) {
                if (policyId == policiesResponse.policies[i].id) {
                    const userId = policiesResponse.policies[i].clientId;
                    return request({
                            method: 'GET',
                            uri: getUsersRequestUri + '/' + userId,
                            json: true
                        })
                        .then((userResponse) => {
                            res.set('Content-Type', 'application/json');
                            res.end(JSON.stringify(userResponse));
                            return log.debug('User with id: [', userId, '] found');
                        })
                        .catch((err) => {
                            if (404 == err.statusCode) {
                                res.statusCode = 404;
                                res.end();
                                return log.warn('User with id: [', userId, '] not found (data inconsistency?)');
                            }

                            res.statusCode = 500;
                            res.end();
                            return log.error('Internal server error: ', err);
                        });
                }
            }

            res.statusCode = 404;
            res.end();
            return log.info('Policy with id: [', policyId, '] not found');
        })
        .catch((err) => {
            res.statusCode = 500;
            res.end();
            return log.error('Internal server error: ', err);
        });
};

var server = api.listen(8002, '127.0.0.1', () => {
    var host = server.address().address;
    var port = server.address().port;

    log.info('Starting user service listening on http://', host, ':', port);
});

var swaggerDefinition = {
    info: {
        title: 'Policy Service API',
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