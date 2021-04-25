const mongoose = require("mongoose");

const personalSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    percentCompleted: {
        type: Number
    },

    skinColor: {
        type: String
    },
    hairLength: {
        type: String
    },
    hairColor: {
        type: String
    },
    hairType: {
        type: String
    },
    eyesColor: {
        type: String
    },
    length: {
        type: String
    },
    weight: {
        type: String
    },
    religion: {
        type: String
    },
});

const Personal = mongoose.model("personal", personalSchema);
module.exports = Personal;