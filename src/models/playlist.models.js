import mongoose,{Schema} from "mongoose";

const PlaylistSchema=new Schema({
    videos:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        index:true
    },
    description:{
        type:String,
        lowercase:true,
        trim:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",PlaylistSchema);