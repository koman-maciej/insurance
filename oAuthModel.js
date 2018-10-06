const jwt = require('jsonwebtoken');
const request = require('request-promise');

const model = module.exports;
model.JWT_ACCESS_TOKEN_EXPIRY_SECONDS = 3600; // 60 minutes
model.JWT_ACCESS_TOKEN_USER_ROLE = 'user';
model.JWT_ACCESS_TOKEN_ADMIN_ROLE = 'admin';

const JWT_ISSUER = 'amaris';
const JWT_SECRET_FOR_ACCESS_TOKEN = 'YMRqCXE49YVJqelG3bPQ';

const getUsersRequestUri = 'http://www.mocky.io/v2/5808862710000087232b75ac';
const generalUserPassword = 'qwerty';

const oauthClients = [{
    clientId: 'amaris',
    clientSecret: 'amarissecret',
}];

// key is grant_type
// value is the array of authorized clientId's
const authorizedClientIds = {
    password: ['amaris']
};

model.generateToken = (type, req, callback) => {
    var token;
    var secret = JWT_SECRET_FOR_ACCESS_TOKEN;
    var user = req.user;
    var exp = new Date();
    var payload = {
        iss: JWT_ISSUER,
        username: user.id,
        role: user.role
    };

    exp.setSeconds(exp.getSeconds() + model.JWT_ACCESS_TOKEN_EXPIRY_SECONDS);
    payload.exp = Math.round(exp.getTime() / 1000);
    token = jwt.sign(payload, secret, {
        algorithms: ['HS256']
    });

    callback(false, token);
};


model.getAccessToken = (bearerToken, callback) => {
    return jwt.verify(bearerToken, JWT_SECRET_FOR_ACCESS_TOKEN, (err, decoded) => {

        if (err) {
            return callback(err, false); // the err contains JWT error data
        }

        return callback(false, {
            expires: new Date(decoded.exp * 1000),
            user: {
                id: decoded.username,
                role: decoded.role
            }
        });
    });
};

model.saveAccessToken = (accessToken, clientId, expires, username, callback) => {
    return callback(false);
};

model.getClient = (clientId, clientSecret, callback) => {
    for (var i = 0, len = oauthClients.length; i < len; i++) {
        var elem = oauthClients[i];
        if (elem.clientId === clientId &&
            (clientSecret === null || elem.clientSecret === clientSecret)) {
            return callback(false, elem);
        }
    }
    callback(false, false);
};

model.grantTypeAllowed = (clientId, grantType, callback) => {
    callback(false, authorizedClientIds[grantType] &&
        authorizedClientIds[grantType].indexOf(clientId.toLowerCase()) >= 0);
};

model.getUser = (username, password, callback) => {

    request({
            method: 'GET',
            uri: getUsersRequestUri,
            json: true
        })
        .then((response) => {
            for (var i = 0, len = response.clients.length; i < len; ++i) {
                if (username == response.clients[i].email && password == generalUserPassword) {
                    return callback(false, response.clients[i]);
                }
            }

            return callback(false, false);
        })
        .catch((err) => {
            return callback(false, false);
        });
};