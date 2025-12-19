import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import {asynchandler} from "../../utils/asynchandler.js"
import { Like } from "../models/like.models.js"

const toggleVideoLike = asynchandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }
    const userId=req.user._id;
    const likedvideo=await Like.findOne({video:videoId,owner:userId});
    if(likedvideo){
        await Like.findByIdAndDelete(likedvideo._id);
        return res.status(200)
        .json(new ApiResponse(200,{},"Unliked Succesfully"));
    }
    const liked=await Like.create({
        owner:userId,
        video:videoId
    })
    return res.status(200)
    .json(new ApiResponse(200,liked,"Liked Succesfully"));
})

const toggleCommentLike = asynchandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id")
    }
    const userId=req.user._id;
    const likedcomment=await Like.findOne({comment:commentId,owner:userId});
    if(likedcomment){
        await Like.findByIdAndDelete(likedcomment._id);
        return res.status(200)
        .json(new ApiResponse(200,{},"Unliked Succesfully"));
    }
    const liked=await Like.create({
        owner:userId,
        comment:commentId
    })
    return res.status(200)
    .json(new ApiResponse(200,liked,"Liked Succesfully"));
})

const toggleTweetLike = asynchandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id")
    }
    const userId=req.user._id;
    const likedtweet=await Like.findOne({tweet:tweetId,owner:userId});
    if(likedtweet){
        await Like.findByIdAndDelete(likedtweet._id);
        return res.status(200)
        .json(new ApiResponse(200,{},"Unliked Succesfully"));
    }
    const liked=await Like.create({
        owner:userId,
        tweet:tweetId
    })
    return res.status(200)
    .json(new ApiResponse(200,liked,"Liked Succesfully"));
}
)

const getLikedVideos = asynchandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user._id;
    const likedVideos=await Like.aggregate([{
        $match:{owner:new mongoose.Types.ObjectId(userId)}
    },{
        $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"video",
            pipeline:[{
                $project:{
                    views:1,
                    title:1,
                    description:1,
                    duration:1,
                    thumbnail:"$thumbnail.url",
                    video:"$videoFile.url",
                }
            }]
        }
    },{
            $unwind: "$video"
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        }])
    return res.status(200)
    .json(new ApiResponse(200,likedVideos,"Liked Videos Fetched Succesfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}