application = module.exports = {}
const Express = require("express");
const PORT = process.env.PORT
const app = Express();
const bodyParser = require('body-parser');
const passport = require("passport");
const helmet = require('helmet');

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const dotenv = require('dotenv').config();
const compression = require("compression");
const cors = require("cors");

// import main routes
const signServ = require("../service/sign.service")
const userServ = require("../service/user.service")
const discussionServ = require("../service/discussion.service")
const seekServ = require("../service/seek.service")
const ovivServ = require("../service/oviv.service")



//https://www.npmjs.com/package/cors
/*let corsOptions = {
    origin: ,
    methods: "GET, PUT, POST"
}*/

application.initServer = () => {
    app.use(compression({
        level: 6
    }));
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "OPTIONS, GET, POST, PUT, PATCH, DELETE"
        );
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        next(); // dont forget this
      });
    app.use(bodyParser.json());
    app.use(passport.initialize());
    require("./../config/passport")(passport);
    app.use(cors());
    app.enable('trust proxy');
    app.use(helmet());

    //use routes
    app.use("/", ovivServ);
    app.use("/sign", signServ);
    app.use("/user", passport.authenticate("jwt", {
        session: false
    }), userServ);
    app.use("/discussion", passport.authenticate("jwt", {
        session: false
    }), discussionServ);
    app.use("/seek", passport.authenticate("jwt", {
        session: false
    }), seekServ);
}


application.exeServer = () => {
    console.log(`Server is working on ${process.env.PORT}`)
    http.listen(process.env.PORT);
}

/*io.on('connection', (socket)=> {
  console.log('Client connected to the WebSocket');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});*/