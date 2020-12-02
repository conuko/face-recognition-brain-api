import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';

const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

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


// /SIGN IN --> check if the user typed in on the frontend Signin.js is already in the database
app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash); // check if the password is correct with bcrypt
        if (isValid) {
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'));
        } else {
            res.status(400).json('wrong credentials');
        }
    })
    .catch(err => res.status(400).json('wrong credentials'));
})

// /REGISTER --> create a new user based on the information typed in on the frontend Register.js
app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    // Store hash in your password DB:
    const hash = bcrypt.hashSync(password, saltRounds);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*') /* user insert Ann and return all the columns  */
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
                })
                .then(user => { /* user gets posted to db in json format */
                    res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
        .catch(err => res.status(400).json('unable to register')) /* drops an error, for example when the same user already exists */
});

// /PROFILE/:USER ID
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users')
        .where({id}) /* to get the user profil connected to the typed in ID */
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Not found')
            }
        })
        .catch(err => res.status(400).json('Not found'));
})

// /IMAGE --> count how many entries a user has. The entry gets updated everytime the user let the program detect a face in an image:
app.put('/image', (req, res) => {
    const { id } = req.body;
    // grab the entries from the database and increase it:
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'));
})

app.listen(3000, () => {
    console.log('app is running on port 3000');
});