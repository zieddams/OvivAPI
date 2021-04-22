const User = require("../schema/user.schema");
const express = require("express");
const router = express.Router();
const userFunctions = require("../functions/user.functions");
const STATUES = require("../config/config.application").STATUES_CODE;
const rateLimit = require("express-rate-limit");
const userTesting = require("../UnitTesingScenes/users")

const  get_ip = require('ipware')().get_ip;
const geoip = require('geoip-country');
const setLocation = require("../middleware/routingmiddleware").setLocation;



const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 h
    max: 1, // limit each IP to 1 reset password request/ 1h,
    message:"you can't use this for a while because your new passwred was already send to your email, go check"
})

module.exports = router;

router.get("/ip",setLocation,(req,res)=>{
    /*ip  = get_ip(req);
    geo = geoip.lookup(ip.clientIp);*/
    /*console.log(ip)
    console.log(geo)*/
    res.send(req.ip+req.country)
})


router.get("/test/createRandromUsers",(req,res)=>{
    userTesting.createRandomUser()
    res.send('done')
})

router.get("/", (req, res) => {

        const routersHTML = `<style>
        .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .item,
        .item2 {
          margin: 5px;
          padding: 5px;
        }
        .item2 {
          display: flex;
        }
        .item2>div {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .item2>div>h3 {
          align-self: center;
          background: #ebebf1db;
          border-radius: 10px;
          margin: 10px;
          padding: 10px;
        }
        details {
          background: #ebebf1db;
          border-radius: 10px;
          margin: 10px;
          padding: 20px;
        }
        summary {
          cursor: pointer;
          font-weight: bold;
        }
        .public_route {
          font-size: 11;
          float: right;
          color: white;
          background-color: darkblue;
          padding: 5px;
          border-radius: 7px;
        }
        .private_route {
          font-size: 11;
          float: right;
          color: white;
          background-color: #8B0000;
          padding: 5px;
          border-radius: 7px;
        }
        .under{
          align-self: center;
          background: #ff9104db;
          border-radius: 10px;
          margin: 10px;
          padding: 10px;
          color: white;
          font-weight: bold;
          border: 1px solid black;
      
        }
      </style>
      <nav class="container">
        <div class="item2">
          <!--item-->
          <div>
            <h3>/</h3>
            <details>
              <summary>/<small class="public_route">Public Route</small></summary>
              <br>
              @GET <br><br>
              @desc : <small>Welcom</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
            <details>
              <summary>resetPassword <small class="public_route">Public Route</small></summary><br>
              @POST <br><br>
              @desc : <small>send new password to user email.</small><br><br>
              @params : <small>{ email }</small>
              <br>
            </details>
            <details>
              <summary>/verify/:id/:secretCode <small class="public_route">Public Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Activate account, this route must open from email.</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
          </div>
          <!--item-->
          <div>
            <h3>/sign</h3>
            <details>
              <summary>/up <small class="public_route">Public Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Create new user && Send email validation.</small><br><br>
              @params : <small>{ name,email,birth,password,gender,address,create_date }</small>
              <br>
            </details>
            <details>
              <summary>/in <small class="public_route">Public Route</small></summary><br>
              @POST <br><br>
              @desc : <small>login a user</small><br><br>
              @params : <small>{ authenticator,password }</small>
              <br>
            </details>
            <details>
              <summary>/google <small class="public_route">Public Route</small></summary><br>
              @GET <br><br>
              @desc : <small>Register a user using client google account and login him directly</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
            <details>
              <summary>/facebook <small class="public_route">Public Route</small></summary><br>
              @GET <br><br>
              @desc : <small>Register a user using client facebook account and login him directly</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
          </div>
          <!--item-->
          <div>
            <h3>/user</h3>
            <details>
              <summary>/validate <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Send an email with a new link to validate account</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
            <details>
              <summary>/updatePassword <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>modify account password</small><br><br>
              @params : <small>{ oldPassword,newPassword }</small>
              <br>
            </details>
            <details>
              <summary>/updateBasicInfos <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>update basic Info like name, address ...</small><br><br>
              @params : <small>{ basicInfos }</small>
              <br>
            </details>
            <details>
              <summary>/updateInterests <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Change his interests</small><br><br>
              @params : <small>{ interests[] }</small>
              <br>
            </details>
            <details>
              <summary>/updateEducationWork <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Change his education and/or work</small><br><br>
              @params : <small>{ EducationWork }</small>
              <br>
            </details>
            <details>
              <summary>/updatePrivacy <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Change user privacy. exp :  follow public or private</small><br><br>
              @params : <small>{ privacy }</small>
              <br>
            </details>
            <details>
              <summary>/updateProfilePic <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Change user profile picture</small><br><br>
              @params : <small>{ profilePic }</small>
              <br>
            </details>
            <details>
              <summary>/getprofilepic <small class="private_route">Private Route</small></summary><br>
              @GET <br><br>
              @desc : <small>get user profile picture</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
            <details>
              <summary>/deletePic <small class="private_route">Private Route</small></summary><br>
              @DELETE <br><br>
              @desc : <small>Delete picture from user gallery</small><br><br>
              @params : <small>{ picId }</small>
              <br>
            </details>
            <details>
              <summary>/getGallery <small class="private_route">Private Route</small></summary><br>
              @GET <br><br>
              @desc : <small>return list of pictures (gallery)</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
            <details>
              <summary>/uploadPic <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>upload new picture to the gallery</small><br><br>
              @params : <small>{ newPic }</small>
              <br>
            </details>
            <details>
              <summary>/followRequest <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>follow another user or send a follow request if it's private</small><br><br>
              @params : <small>{ userRequested }</small>
              <br>
            </details>
            <details>
              <summary>/acceptFollow <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Accept a follow request if you'r making it private</small><br><br>
              @params : <small>{ newFollower }</small>
              <br>
            </details>
            <details>
              <summary>/blockUser <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>prevent a user from seeing your account</small><br><br>
              @params : <small>{ bloquedUser }</small>
              <br>
            </details>
            <details>
              <summary>/favoriteFollower <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>make one of your followers favorite </small><br><br>
              @params : <small>{ follower_id }</small>
              <br>
            </details>
            <details>
              <summary>/personalData <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>change user personal data like eyes color, hair color  ... </small><br><br>
              @params : <small>{ personalData[] }</small>
              <br>
            </details>
            <details>
              <summary>/likePic <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>like user picture</small><br><br>
              @params : <small>{ userId , picId }</small>
              <br>
            </details>
            <details>
              <summary>/commentPic <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>make a comment on a user picture</small><br><br>
              @params : <small>{ userId , picId , commentBody }</small>
              <br>
            </details>
            <details>
              <summary>/likeComment <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>make a reaction on a specific comment </small><br><br>
              @params : <small>{ userId , picId , commentId }</small>
              <br>
            </details>
          </div>
          <div>
            <h3>/discussion</h3>
            <details>
              <summary>/messagebox <small class="private_route">Private Route</small></summary><br>
              @GET <br><br>
              @desc : <small>Get user messages lists</small><br><br>
              @params : <small>{ none }</small>
              <br>
            </details>
            <details>
              <summary>/sendmessage <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>Send message to another user XD.</small><br><br>
              @params : <small>{ messageBody{ partnerId , text } }</small>
              <br>
            </details>
            <details>
              <summary>/buydiscussion <small class="private_route">Private Route</small></summary><br>
              @POST <br><br>
              @desc : <small>buy a new discussion </small><br><br>
              @params : <small>{ partnerId }</small>
              <br>
            </details>
            <details>
              <summary>/discussion <small class="private_route">Private Route</small></summary><br>
              @GET <br><br>
              @desc : <small>return the full discussion between connected user and a specific user</small><br><br>
              @params : <small>{ partnerId }</small>
              <br>
            </details>
          </div>
          <div>
            <h3>/seek</h3>
            <details>
              <summary>/<small class="private_route">Private Route</small></summary><br>
              @GET <br><br>
              @desc : <small>Search for users</small><br><br>
              @params : <small>{ filters }</small>
              <br>
            </details>
            <p class="under">
              Still under constructions.
            </p>
          </div>
        </div>
      </nav>`;
    let HTMLdisplay =routersHTML+ `
    <div style="height: 100%;display: flex;align-items: center;justify-content: center;">
        <h1 style="color: #e68b2fcc;font-size: xxx-large;font-family: system-ui;">Welcom To Oviv-API services</h1>
      </div>`
    res.send(HTMLdisplay);
})

router.post("/resetPassword",resetPasswordLimiter, (req, res) => {
    email = req.body.email;
    User.findOne({
        "email.value": {
            "$in": [email]
        }
    }).then((user) => {
        if (!user) {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "User not found !"
            });
        } else {
            newPassword = userFunctions.getNewPassword();
            userFunctions.updatePassword(user, newPassword, req.body.action_date);
            userFunctions.SendNewPasswordEmail(email,newPassword)
            res.json({
                code:STATUES.OK,
                msg:"a new password was sended to your email"
            })
        }
    });
});

router.post("/verify/:id/:secretCode", (req, res) => {
    User.findById(req.params.id).then((user) => {
        if (user.secretCode === req.params.secretCode) {
            User.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    isVerified: true
                }
            }).exec();
            res.json({
                code: STATUES.OK,
                msg: "Account Verified With Success"
            });
        } else {
            res.json({
                code: STATUES.NOT_VALID,
                msg: "Account Cannot Be Verified"
            });
        }
    }).catch(() => {
        res.json({
            code: STATUES.NOT_FOUND,
            msg: "User Not Found"
        });
    });
});