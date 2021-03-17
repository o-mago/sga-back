const db = require("../models");
const User = db.sequelize.import("../models/users");
const axios = require("axios");
var LdapStrategy = require('passport-ldapauth');
var passport = require('passport');
const logger = require('./logger');
var basicAuth = require('basic-auth');

exports.login = function (req, res) {
    let user = {
        username: "",
        password: ""
    }
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(400).json({ message: 'Something is wrong with the system' });
    } else {
        const base64Credentials =  req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const [_username, _password] = credentials.split(':');
        user = {
            username: _username,
            password: _password
        }
    }

    new Promise((resolve, reject) => resolve(checkUserDB(user)))
    .then((result) => {
        if(result === null) {
            return res.status(401).json({ message: 'No matching user' });
        } else if (result != 0) {
            return res.status(401).json({ message: 'Insufficient privileges' });
        }
        console.log(process.env.LDAP_BIND_DN);
        var OPTS = {
            credentialsLookup: basicAuth,
            server: {
                url: process.env.LDAP_URL,
                bindDN: 'cn=' + user.username + ',' + process.env.LDAP_BIND_DN,
                bindCredentials: user.password,
                searchBase: process.env.LDAP_SEARCH_BASE,
                searchFilter: process.env.LDAP_SEARCH_FILTER
            }
        };
        passport.use(new LdapStrategy(OPTS));
        passport.authenticate('ldapauth', { session: false },
            (err, user, info) => {
                if (err) {
                    return res.status(400).json({ message: 'Something is wrong with the system' });
                }
                if (!user) {
                    console.log(info);
                    return res.status(401).json({ message: 'Wrong credentials' });
                }
                logger.info("user "+user.username+" logged in");
                return res.status(200).json({ token: token() });
            }
        )(req, res);
    });
};

const checkUserDB = (user) => {
    return User.findOne({
        raw: true,
        attributes: ['privilege'],
        where: {
            id: user.username
        }
    }).then(username => {
        return username ? username.privilege : null;
    }).catch(err => console.log(err));
}

const rand = function() {
    return Math.random().toString(36).substr(2);
};

const token = function() {
    return rand() + rand();
};