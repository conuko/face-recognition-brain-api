import { json } from 'body-parser';
import Clarifai from 'clarifai';

// API key from Clarifai
const app = new Clarifai.App({
    apiKey: '791bc87bd9474e4086709eec678ec68c'
  });

const handleApiCall = (req, res) => {
    app.models
        .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data);
        })
        .catch(err => res.status(400).json('unable to work with API'));
}


const handleImage = (req, res, db) => {
    const { id } = req.body;
    // grab the entries from the database and increase it:
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'));
}

export default {
    handleImage: handleImage,
    handleApiCall: handleApiCall
};