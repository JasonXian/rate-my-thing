var mongoose = require("mongoose");

var thingSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    long: Number,
    rating: {type: Number, default: 5},
    created: { type: Date, default: Date.now},
    authour: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }    
    ]
});

module.exports = mongoose.model("Thing", thingSchema);