import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import lodash from 'lodash';
import ejs from 'ejs';

const port = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

app.get('/', async function(req, res){
    res.redirect('/home');
});

app.get('/home', async function(req, res){
    res.render('home');
});


app.listen(port, function () {
    console.log(`listening on ${port}`);
});