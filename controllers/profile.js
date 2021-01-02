const handleProfileGet = (req, res, db) => {
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
}

export default {handleProfileGet: handleProfileGet};