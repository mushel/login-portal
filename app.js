var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

const dashboardRouter = require("./routes/dashboard"); 
const seekerRouter = require("./routes/seeker");         
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");

var app = express();
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-807318.okta.com',
  token: '00seUJaxFlfKwFYtRaISclGCenIf_SfoNgCCi7sW6t'
});
const oidc = new ExpressOIDC({
  issuer: "https://dev-807318.okta.com/oauth2/default",
  client_id: '0oa1xyulxzxWpGrk1357',
  client_secret: 'gMxxBcm8nHLBUFZ_ZHIJgtwUilPnOXaUU9ev6bAD',
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});
// new seeker login
//const oidc = new ExpressOIDC({
//  issuer: "https://dev-807318.okta.com/oauth2/default",
//  client_id: '0oa2a5f0itQRpMKhQ357',
//  client_secret: '4tFOnrBBkh1kVNsb_-XGoPwmOuR8O2r_2E5PXErH',
//  redirect_uri: 'http://localhost:3000/users/callback',
//  scope: "openid profile",
//  routes: {
//    login: {
//      path: "/users/login"
//    },
//    callback: {
//      path: "/users/callback",
//      defaultRedirect: "/seekerDashboard"
//    }
//  }
//});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'asdf;lkjh3lkjh235l23h5l235kjh',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
}

app.use('/', publicRouter);
app.use('/seeker', seekerRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
