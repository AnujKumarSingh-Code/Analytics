const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://anujkumarsinghcoder:QgSvKNYjniJWzg0F@project-next.amlt0ce.mongodb.net/?retryWrites=true&w=majority&appName=project-next');

const userSchema = new mongoose.Schema({
    username: String,
    links: [{ linkName: String, url: String }]
});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    const users = await User.find();
    res.render('index', { users });
});

app.get('/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
        res.render('user', { user });
    } else {
        res.status(404).send('User not found');
    }
});

app.post('/:username/add-link', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
        user.links.push({
            linkName: req.body.linkName,
            url: req.body.url
        });
        await user.save();
        res.redirect(`/${req.params.username}`);
    } else {
        res.status(404).send('User not found');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
