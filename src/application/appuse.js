application =module.exports={}
const Express = require("express");
const PORT = process.env.PORT
const app = Express();
const bodyParser = require('body-parser');
const passport = require("passport");

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const dotenv = require('dotenv').config();
const cors =require("cors");

// import main routes
const signServ = require("../service/sign.service")
const userServ = require("../service/user.service")
const discussionServ = require("../service/discussion.service")
const seekServ = require("../service/seek.service")
const ovivServ = require("../service/oviv.service")



//https://www.npmjs.com/package/cors
let corsOptions = {
    origin: function (origin, callback) {
        callback(null, true)
    },
    methods: "GET, PUT, POST"
}

application.initServer=()=>{
app.use(bodyParser.urlencoded({
    extended: false
 }));
 app.use(bodyParser.json());
 app.use(passport.initialize());
 require("./../config/passport")(passport);
 app.use(cors(corsOptions));

 //use routes
 app.use("/sign",signServ);
 app.use("/",ovivServ);
 app.use("/user",passport.authenticate("jwt", {session: false}),userServ);
 app.use("/discussion",passport.authenticate("jwt", {session: false}),discussionServ);
 app.use("/seek",passport.authenticate("jwt", {session: false}),seekServ);
}


application.exeServer=()=>{
    console.log(`Server is working on ${process.env.PORT}` )
        http.listen(process.env.PORT);
    }

/*io.on('connection', (socket)=> {
  console.log('Client connected to the WebSocket');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});*/