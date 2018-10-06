const express = require('express');
const request = require('request-promise');
const log = require('simple-node-logger').createSimpleLogger();

const api = express()

const getUsersRequestUri = 'http://www.mocky.io/v2/5808862710000087232b75ac';

// Assumptions:
// name is unique
// api to the data should not change (contract)

//TODO: https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications

api.get('/users/:userId', function(req, res) {
    var userId = req.params.userId;
    log.info('Handling get user by id: [', userId, ']');

    request({method: 'GET', uri: getUsersRequestUri, json: true})
      .then((response) => {
        for (var i = 0, len = response.clients.length; i < len; ++i) {
            if (userId == response.clients[i].id) {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(response.clients[i]));
                return log.debug('User with id: [', userId, '] found');
            }
        }

        res.statusCode = 404;
        res.end();
        return log.info('User with id: [', userId, '] not found');
      })
      .catch( (err) => {
        res.statusCode = 500;
        res.end();
        return log.error('Internal server error: ', err);
      })
});

api.get('/users', (req, res) => {
    const name = req.query.name;
    log.info('Handling get user by name: [', name, ']');

    if (!name) {
        res.statusCode = 400;
        res.end();
        return log.info('Bad request on missing parameter [name]');
    }

    request({method: 'GET', uri: getUsersRequestUri, json: true})
      .then((response) => {
        for (var i = 0, len = response.clients.length; i < len; ++i) {
            if (name == response.clients[i].name) {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(response.clients[i]));
                return log.debug('User with name: [', name, '] found');
            }
        }

        res.statusCode = 404;
        res.end();
        return log.info('User with name: [', name, '] not found');
      })
      .catch( (err) => {
        res.statusCode = 500;
        res.end();
        return log.error('Internal server error: ', err);
      })
});

var server = api.listen(8080, '127.0.0.1', () => {
    var host = server.address().address;
    var port = server.address().port;

    log.info('Starting user service listening at http://', host, ':', port);
});