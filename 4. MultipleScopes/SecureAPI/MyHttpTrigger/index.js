const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const passport = require('passport');

var BearerStrategy = require("passport-azure-ad").BearerStrategy;
var options = {
    identityMetadata: "https://login.microsoftonline.com/ee3a46c9-d875-4eb1-a3e9-6f412a53d127/v2.0/.well-known/openid-configuration",
    clientID: "ee3a46c9-d875-4eb1-a3e9-6f412a53d127",
    issuer: "https://sts.windows.net/ee3a46c9-d875-4eb1-a3e9-6f412a53d127/",
    audience: "https://securefunctionapi.jeremydelacruz.onmicrosoft.com",
    loggingLevel: "info",
    passReqToCallback: false
};

var bearerStrategy = new BearerStrategy(options, function (token, done) {
    done(null, {}, token);
});

const app = express();

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
passport.use(bearerStrategy);

// Enable CORS for * because this is a demo project
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// This is where your API methods are exposed
app.get(
    "/api",
    passport.authenticate("oauth-bearer", { session: false }),
    function (req, res) {
        var claims = req.authInfo;
        console.log("User info: ", req.user);
        console.log("Validated claims: ", claims);
        res.status(200).json({ name: claims["name"] });
    }
);

module.exports = createHandler(app);
