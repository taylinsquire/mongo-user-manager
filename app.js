const app = require('express')();
const port = process.env.PORT || 3000;
const fs = require('fs');

const mongoose = require('mongoose');
const dbConnectionString = 'mongodb://localhost/userdb';
mongoose.connect(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const udb = mongoose.connection;
udb.on('error', console.error.bind(console, 'connection error:'));
udb.once('open', () => {
  console.log('db connected');
});

const userSchema = new mongoose.Schema({
  userid: Number,
  name: String,
  email: String,
  age: { type: Number, min: 18, max: 70 },
});

const users = mongoose.model('user', userSchema);

const userstemp = [
  {
    id: 0,
    name: 'Jim',
    email: 'blah',
    age: '25',
  },
  {
    id: 1,
    name: 'Jane',
    email: 'blah',
    age: '30',
  },
  {
    id: 2,
    name: 'Bob',
    email: 'blah',
    age: '60',
  },
];

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/userlist', (req, res) => {
  users.find({}, {}, {}, (err, data) => {
    if (err) throw err;
    res.render('userList', {users: data});
  })
});

app.post('/newuser', (req, res) => {
  res.render();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
