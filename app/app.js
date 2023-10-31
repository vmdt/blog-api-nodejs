const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const oauthRoute = require('../routes/oauthRoute');
const userRoute = require('../routes/userRoute');
const postRoute = require('../routes/postRoute');
const commentRoute = require('../routes/commentRoute');
const notifyRoute = require('../routes/notifyRoute');
const bookmarkRoute = require('../routes/bookmarkRoute');
const groupRoute = require('../routes/groupRoute');
const globalErrorHandler = require('../middlewares/errHandler');
require('dotenv').config();

const app = express();

const store = session.MemoryStore();
app.use(
  session({
    saveUninitialized: false,
    secret: 'keyboard cat',
    resave: false,
    store,
    cookie: {
      maxAge: 1000*60
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(morgan('dev'));
app.use(cookieParser());

// Route
app.use('/api/v1/users', userRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/notifications', notifyRoute);
app.use('/api/v1/bookmarks', bookmarkRoute);
app.use('/api/v1/groups', groupRoute);
app.use('/auth', oauthRoute);

app.get('/chat', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(globalErrorHandler);
module.exports = app;
