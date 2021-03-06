const mongoose =require("mongoose");
const schemaValidator = require('./../functions/users.schema.functions');


const userSchema=mongoose.Schema({
    googleId:{type: String},
    facebookId:{type: String},
    name:{
        username:  { type: String, unique:true, required: true, trim: true, index: true, minLength:6 },
        lastName:  { type: String, trim: true, minLength:2,maxLength:20, validate :{validator: schemaValidator.OnlyCharacters, msg: 'last name can not accept numbers '}},
        firstName: { type: String, trim: true, minLength:2,maxLength:20, validate :{validator: schemaValidator.OnlyCharacters, msg: 'first name can not accept numbers '}},
    },
    
    email:{
        value: { type: String, required: true, unique: true, trim: true, index: true,  validate :{validator: schemaValidator.isValidEmail, msg: 'this is not a valid email ' } },
        update: {type: Date, default: Date.now}
    },
    password:{
        value: { type: String, required: true, index: true, minLength:8 },
        oldValue: {type:String},
        update: {type: Date}
    },
    birth: {
      birthday:  { type: Date/*, required: true */},
      age: {type: Number , }
    },
    gender:{ type: String/*, required: true */},
    phone:{
        value: { type: String, validate :{validator: schemaValidator.isValidPhone, msg: 'this is not a valid phone number '} },
        update: Date
    },
    address:{
        country: { type: String, /*required: true,*/ trim: true },
        state: { type: String, trim: true},
        state_district: { type: String, trim: true},
        county: { type: String, trim: true},
        road: { type: String, trim: true},
        postcode: { type: String, trim: true},
        state: { type: String, trim: true},
        boundingbox:{
            lat1 :{type :String},
            lat2 :{type :String},
            long1 :{type :String},
            long2 :{type :String},
        },
        country_code: {type :String},
        town: {type :String},
        village :{type :String},
    },
    gallery:{
        images:[
            {   isProfilePic:{type:Boolean, default:false},
                isCoverPic:{type:Boolean, default:false},
                text:{type: String,trim: true},
                data:{ type: Buffer},
                likes:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
                comments:[{
                        commentor_id: {type:mongoose.Schema.Types.ObjectId,ref:"user"},
                        comment_body: {type: String},
                        comment_likes:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}]
                }]
            }
        ]

    },
    connection:[{
        lat: String,
        long: String,
        device: String,
        system: String,
        connected_at: {type: Date},
        connection_duration: String,
        isActive: Boolean
    }],
    created_date:{
        type:String,
    },
    followers:[{
        user_id: {type:mongoose.Schema.Types.ObjectId,ref:"user"},
        follow_date: {type:Date, default: Date.now},
        isFavorite: {type:Boolean, default: false},
    }],

    notification_list:[
        {
            notif_type: {type:String},
            target_user_id:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
            is_seen:{type:Boolean, default:false}
        }
    ],
    isOnline:Boolean,
    isFollowPublic:{type:Boolean, default:true},
    secretCode:{type:String},

    blockedUsers:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    isVerified:{ type:Boolean, default:false },
    description:{type:String,minLength:10 },
    education:{type:String, minLength:6},
    work:{type:String , minLength:6},
    interests:[{type: mongoose.Schema.Types.ObjectId,index:true}],

    message_box:[{type:mongoose.Schema.Types.ObjectId,ref:"discussion"}],
    oviv_currency: Number


});
const user =mongoose.model("user",userSchema);
module.exports=user;

/**
 * db.users.createIndex(
   {
	"name.username": "text",
	description: "text",
	education:"text",
	work:"text",
	gender:"text",
	"address.country":"text"

   }
 )
//https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/
https://stackoverflow.com/questions/36028538/does-it-make-sense-to-separate-the-table-of-user-profile-to-that-of-the-login-de
*/