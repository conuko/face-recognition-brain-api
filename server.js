import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';

import register from './controllers/register.js';
import signin from './controllers/signin.js';
import profile from './controllers/profile.js';
import image from './controllers/image.js';

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'marshall',
      database : 'smartbrain'
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working!') });
// /SIGN IN --> check if the user typed in on the frontend Signin.js is already in the database
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) });
// /REGISTER --> create a new user based on the information typed in on the frontend Register.js
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });
// /PROFILE/:USER ID
app.get('/profile/:id', (req, res) => {profile.handleProfileGet(req, res, db) });
// /IMAGE --> count how many entries a user has. The entry gets updated everytime the user let the program detect a face in an image:
app.put('/image', (req, res) => { image.handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT}`);
});