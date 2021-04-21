application = module.exports = {}
const Express = require("express");
const app = Express();
const passport = require("passport");
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const dotenv = require('dotenv').config();
const compression = require("compression");

// security dependencies

const cors = require("cors");
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const express_enforces_ssl = require("express-enforces-ssl");

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

    /** && */
    app.use(passport.initialize());
    require("./../config/passport")(passport);

    app.use(compression({
        level: 6
    }));

    app.use(Express.urlencoded({
        extended: false
    }));
    app.use(Express.json())

    // security

    app.use(cors());
    app.use(helmet());
    app.use(xss())
    app.use(mongoSanitize());
    //app.use(express_enforces_ssl());
    app.enable('trust proxy');

    //use main routes
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