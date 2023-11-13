const express = require('express');
// const fileUpload = require('fileupload');
const bodyParser = require('body-parser');
const lodash = require('lodash');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const mongodb = require('mongodb');
const mongoose  = require('mongoose');

const port = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// app.use(fileUpload());

app.use(session({
    secret: "navaneethjainsl",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const db = mongoose.connect('mongodb+srv://navaneethjainsl:njieeehackathon@cluster0.rc9sazc.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true});
// mongoose.set("userCreateIndex", true);

const userSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        unique: true,
        dropDups: true,
        required: true,
    },
    password: String,
    team: Boolean,
    teamId: mongoose.Schema.Types.ObjectId
});

userSchema.plugin(passportLocalMongoose);

const groupSchema = new mongoose.Schema({
    teamName: {
        type: String,
        unique: true,
        dropDups: true,
        required: true,
    },
    teamkey: String,
    participants: [mongoose.Schema.Types.ObjectId],
    projectURL: String,
    dateOfSubmition: Date,
});

const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', async function(req, res){
    res.redirect('/home');
});

app.get('/home', async function(req, res){
    res.render('home');
});

app.get('/register', async function(req, res){
    // if(req.isAuthenticated()){
    //     res.render('register');
    // }
    // else{
    //     res.redirect('/register');
    // }

    res.render("register");
});

app.post('/signup', async function(req, res){
    User.register({username: req.body.username}, req.body.password, async function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect('/register');
        }
        else{

            // console.log(user);
            user.name = req.body.name;
            user.team = false;
            user.teamId = null;
            await user.save();
            
            passport.authenticate("local")(req, res, function(){
                res.redirect(`/team/${user._id}`);
            })
        }
      
    });
});

app.post('/login', async function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, async function(err){
        if(err){
            console.log(err);
            res.redirect('/register');
        }
        else{
            userData = await User.find({ username: user.username}).exec();
            // console.log(userData)

            passport.authenticate("local")(req, res, function(){
                if(userData[0].team){
                    res.redirect(`/yourteam/${userData[0]._id}`);
                }
                else{
                    res.redirect(`/team/${userData[0]._id}`);
                }
            });
        }
    })
});

app.get('/team/:userId', async function(req, res){
    // console.log(req.params.userId);
    if(req.isAuthenticated()){
        res.render('team', {userId: req.params.userId});
    }
    else{
        res.redirect('/register');
    }

});

app.post('/createteam/:userId', async function(req, res){
    
    if(req.isAuthenticated()){
        const user = await User.findById(req.params.userId);

        const group = { 
            teamName: req.body.teamname,
            teamkey: req.body.teamkey,
            participants: [user._id],
            projectURL: "",
            dateOfSubmition: null
        }
        
        const grp = await Group.insertMany([group]);
        // console.log(grp);

        user.team = true;
        user.teamId = grp[0]._id;
        await user.save();

        // await User.findByIdAndUpdate(user._id, {teamId: grp._id})

        res.redirect(`/yourteam/${req.params.userId}`);
    }
    else{
        res.redirect('/register');
    }

});

app.post('/jointeam/:userId', async function(req, res){
    
    if(req.isAuthenticated()){
        const user = await User.findById(req.params.userId);
        console.log(user);
        let group = await Group.find({teamName: req.body.teamname});
        group = group[0];
        
        console.log(group);

        if(group.participants.length >= 4){
            res.send("Group is Full");
            setTimeout(function() {
                res.redirect(`/join/${req.params.userId}`);
            }, 5000);
        }
        else{
            group.participants.push(req.params.userId);
            await group.save();

            user.teamId = group._id;
            user.team = true;
            user.save();
    
            res.redirect(`/yourteam/${req.params.userId}`);
        }
        
    }
    else{
        res.redirect('/register');
    }

});

app.get('/yourteam/:userId', async function(req, res){
    if(req.isAuthenticated()){
        const user = await User.findById(req.params.userId);
        // console.log("user");
        // console.log(user);
        let group = await Group.findById(user.teamId);
        console.log("group");
        console.log(group);
        // group = group[0];

        const user1 = await User.findById(group.participants[0]);
        const user2 = await User.findById(group.participants[1]);
        const user3 = await User.findById(group.participants[2]);
        const user4 = await User.findById(group.participants[3]);

        if(!group.projectURL){
            group.projectURL = "";
        }
        
        res.render('yourteam', {groupData: group, user1: user1, user2: user2, user3: user3, user4: user4, currentUser: user});
    }
    else{
        res.redirect('/register');
    }
});

app.post('/yourteam/:userId', async function(req, res){
    const user = await User.findById(req.params.userId);
    let group = await Group.findById(user.teamId);

    group.projectURL = req.body.projectLink;
    group.dateOfSubmition = new Date();
    await group.save();

    res.redirect(`/yourteam/${req.params.userId}`);
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

app.listen(port, function () {
    console.log(`listening on ${port}`);
});