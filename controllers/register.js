const saltRounds = 10;

const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
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
}

export default { handleRegister: handleRegister };