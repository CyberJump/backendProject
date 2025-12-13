import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema= new Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true
    },
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

CommentSchema.plugin(mongooseAggregatePaginate);

export const Comment=mongoose.model("Comment",CommentSchema);
