const JwtStrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy
const FacebookStrategy = require("passport-facebook").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const passport = require("passport");
const User = require("./../schema/user.schema")
const bcrypt = require("bcryptjs");
const JWT_options = {};
const GOOGLE_OAUTH_options = {};
const FACEBOOK_options = {};


JWT_options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
JWT_options.secretOrKey = process.env.SECRET_OR_KEY

GOOGLE_OAUTH_options.clientID = process.env.GOOGLE_CLIENT_ID
GOOGLE_OAUTH_options.clientSecret = process.env.GOOGLE_CLIENT_SECRET
GOOGLE_OAUTH_options.callbackURL = "/sign/auth/google/callback"

FACEBOOK_options.clientID = process.env.FACEBOOK_CLIENT_ID
FACEBOOK_options.clientSecret = process.env.FACEBOOK_CLIENT_SECRET
FACEBOOK_options.callbackURL = "/sign/auth/facebook/callback"
FACEBOOK_options.profileFields = ["id", "birthday", "email", "first_name",/*, "user_gender",*/ "last_name","picture.width(200).height(200)"];

module.exports = (passport) => {

    passport.use(
        new JwtStrategy(JWT_options,async (jwt_payload, done) => {

            User.findById(jwt_payload.id).then((user) => {
                if (user) {
                    user_payload = {
                        id: user._id,
                        email: user.email,
                        name: user.name
                    }
                    return done(null, user_payload);
                }
                return done(null, false);
            }).catch((err) => {
                console.log(err)
            });
        })
    );
    passport.use(
        new GoogleStrategy(GOOGLE_OAUTH_options,
            async (req,accessToken, refreshToken, profile, done) => {
                try {
                    //console.log(GOOGLE_OAUTH_options.clientID)
                    let user = await User.findOne({
                        googleId: profile.id
                    })
                    if (user) {
                        return done(null, user)
                    } else {
                        let salt = bcrypt.genSaltSync(10)
                        let hashPassword = bcrypt.hashSync(profile.id, salt)
                        const newUser = {
                            googleId: profile.id,
                            name: {
                                username: profile.displayName,
                                lastName: profile.name.familyName,
                                firstName: profile.name.givenName
                            },
                            email: {
                                value: profile._json.email
                            },
                            password: {
                                value: hashPassword
                            }
                        }
                        user = await User.create(newUser)
                        return done(null, user)
                    }
                } catch (err) {
                    console.error(err)
                }
            }
        )
    );
    passport.use(new FacebookStrategy(FACEBOOK_options, 
        async (accessToken, refreshToken, profile, done)=>{
            try {
                let user = await User.findOne({
                        facebookId: profile.id
                })
                if (user) {
                        return done(null, user)
                    }
                else{
                    let salt = bcrypt.genSaltSync(10)
                    let hashPassword = bcrypt.hashSync(profile.id, salt)
                    const newUser = {
                            facebookId: profile.id,
                            name: {
                                username: profile._json.first_name+profile._json.last_name,
                                lastName: profile._json.last_name,
                                firstName: profile._json.first_name
                            },
                            email: {
                                value: profile._json.email
                            },
                            password: {
                                value: hashPassword
                            }
                        }
                        user = await User.create(newUser)
                        return done(null, user)
                }
            } catch (err) {
                console.error(err)
            }
        }))

}