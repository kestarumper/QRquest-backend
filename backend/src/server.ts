import * as express from 'express';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import { connect } from 'mongoose';
import * as passport from 'passport';
import * as path from 'path';
import api from './api/routes/api';
import auth from './api/routes/auth';

// Constants
const PORT: number = +process.env.PORT || 3000;
const HOST: string = '0.0.0.0';

// App
const app = express();

const allowedExt = [
    '.js',
    '.ico',
    '.css',
    '.png',
    '.jpg',
    '.woff2',
    '.woff',
    '.ttf',
    '.svg',
];

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.raw({ limit: '50mb' }));
app.use(bodyParser.text({ limit: '50mb' }));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);
app.use('/auth', auth);
// Default page not found handler
    // Redirect all the other resquests
app.get('*', (req, res) => {
    if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
      res.sendFile(path.resolve(`dist/ang/${req.url}`));
    } else {
      res.sendFile(path.resolve('dist/ang/index.html'));
    }
});
  
connect('mongodb://mongo:27017/qrquest')
.catch((err) => {
    throw err;
}).then(() => {
    console.log('Mongoose succesfuly connected');
}).then(() => {
    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);
})


