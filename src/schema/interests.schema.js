const mongoose = require("mongoose");

const interestSchema = mongoose.Schema({
        category: {
                type: String,
                trim: true,
                index: true
        },
        name: {
                type: String,
                index: true,
                unique: true,
                trim: true,
                index: true
        },
});
const Interest = mongoose.model("interest", interestSchema);
module.exports = Interest;