const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require('mongoose');
const dbConnectionString = 'mongodb://localhost/userdb';
mongoose.connect(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const udb = mongoose.connection;
udb.on('error', console.error.bind(console, 'connection error:'));
udb.once('open', () => {
  console.log('db connected');
});

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  age: { type: Number, min: 18, max: 70 },
});

const user = mongoose.model('user', userSchema);

app.use(express.urlencoded({ extended: false }));

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.redirect('/userlist');
});

app.get('/userlist', (req, res) => {
  let sort = req.query.sort ? { sort: {lname:req.query.sort} } : {};
  user.find({}, {}, sort, (err, data) => {
    if (err) throw err;
    res.render('userList', { users: data, currentUrl: req.url, queries: {} });
  });
});

app.get('/searchusers', (req, res) => {
  res.render('searchForm');
});

app.get('/filter-user-list', (req, res) => {
  let searchFilter = {};
  let sort = req.query.sort ? { sort: {lname: req.query.sort} } : {};
  if (req.query.fname && req.query.lname) {
    searchFilter = { $and: [{ fname: req.query.fname }, { lname: req.query.lname }] };
  } else if (req.query.fname) {
    searchFilter = { fname: req.query.fname }
  } else if (req.query.lname) {
    searchFilter = { lname: req.query.lname }
  }
  user.find(searchFilter, {}, sort, (err, data) => {
    if (err) throw err;
    res.render('userList', { users: data, currentUrl: req.url, queries: req.query });
  });
});

app.get('/new-user-form', (req, res) => {
  res.render('newUser');
});

app.post('/new-user-form', (req, res) => {
  const newUser = new user();
  newUser.fname = req.body.fname;
  newUser.lname = req.body.lname;
  newUser.email = req.body.email;
  newUser.age = req.body.age;
  newUser.save((err, results) => {
    if (err) throw err;
    console.log('Document Saved');
  });
  res.redirect('/userlist');
});

app.get('/edit/:id', (req, res) => {
  user.findOne({ _id: req.params.id }, {}, {}, (err, data) => {
    if (err) throw err;
    res.render('editUser', { user: data });
  });
});
app.post('/edit/:id', (req, res) => {
  user.updateOne(
    { _id: req.params.id },
    { fname: req.body.fname, lname: req.body.lname, email: req.body.email, age: req.body.age },
    (err, results) => {
      if (err) throw err;
      res.redirect('/userlist');
    }
  );
});

app.get('/delete/:id', (req, res) => {
  user.deleteOne({ _id: req.params.id }).then(() => {
    res.redirect('/userlist');
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
