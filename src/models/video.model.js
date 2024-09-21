import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videofile:{
        type:String, // cloudnery url
        required:true
    },
    thumbnail: {
        type:String, // cloudnery url
        required: true
    },
    title: {
        type:String, 
        required: true
    },
    description: {
        type:String, 
        required: true
    },
    duration: {
        type: Number, // cloudnery url
        required: true
    },
    views: {
        type: Number, // cloudnery url
        required: true
    },
    isPublished: {
        type:Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId, // reference to user model
        ref: "User"
    }
},
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);