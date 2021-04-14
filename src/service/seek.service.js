const express = require("express");
const passport = require("passport");
const router = express.Router();
const STATUES =require("../config/config.application").STATUES_CODE;

const User = require("../schema/user.schema");
const Personal = require("../schema/personal.schema");
const Interest = require("../schema/interests.schema");
const userFunctions = require("../functions/user.functions");

//const searchable = require('mongoose-searchable');

module.exports = router;

router.get("/",async(req, res) => {
    User.findById(req.user.id).then(async me=> {
           let users = await User.find({
                    $text: { $search: me.address.country },
            })
            cards = userFunctions.listUsersCards(users)
            res.send(cards)
    })
})
router.get("/test",async (req, res)=>{
    /**
     * model => filters = {
     *  gender : {X},
     *  country: {Y}
     * }
     */
    result = await userFunctions.CreatSearchQuery(req.body.filters)

    res.send(result)
})

router.get("/",passport.authenticate("jwt", {session: false}),(req, res)=>{
    User.findById(req.user.id).then(user=>{
        //for implementation
        //https://github.com/lykmapipo/mongoose-searchable
    })    

})