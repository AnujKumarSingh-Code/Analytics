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

// Home route with sign-up form
app.get('/', (req, res) => {
    res.render('index');
});

// Create a new user
app.post('/signup', async (req, res) => {
    const { username } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ username });
    if (user) {
        return res.send('Username already exists');
    }

    // Create a new user
    user = new User({ username, links: [] });
    await user.save();

    res.redirect(`/user/${username}`);
});

// User's page to view and add links
app.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
        return res.send('User not found');
    }

    res.render('user', { user });
});

// Add a link to a user's page
app.post('/user/:username/add-link', async (req, res) => {
    const { username } = req.params;
    const { linkName, url } = req.body;

    // Find the user and add the link
    const user = await User.findOne({ username });
    if (!user) {
        return res.send('User not found');
    }

    user.links.push({ linkName, url });
    await user.save();

    res.redirect(`/user/${username}`);
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
