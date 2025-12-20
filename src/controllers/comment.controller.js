import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import {asynchandler} from "../../utils/asynchandler.js"

const getVideoComments = asynchandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const pipeline=[];
    pipeline.push({
        $match:{video:new mongoose.Types.ObjectId(videoId)}
    },{
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
                {
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:"$avatar.url",
                    }
                }
            ]
        }
    },{
        $unwind:"$owner"
    },{
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"comment",
            as:"likes"
        }
    },{
        $lookup:{
            from:"comments",
            localField:"_id",
            foreignField:"comment",
            as:"replies",
            pipeline:[{
                $project:{"_id":1}
            }]
        }
    },{
        $addFields:{"LikesCount":{$size:"$likes"},"RepliesCount":{$size:"$replies"}}
    },
    {
        $project:{
            likes:0,
            replies:0
        }
    })
    const options={
        page:Number(page),
        limit:Number(limit)
    }
    const aggregate=Comment.aggregate(pipeline)
    const Comments=await Comment.aggregatePaginate(aggregate,options);
    return res.status(200)
    .json(new ApiResponse(200,Comments,"All comments Fetched Succesfully"));
})

const addCommentVideo = asynchandler(async (req, res) => {
    // TODO: add a comment to a video
    const content=req.body?.content;
    if(!content){
        throw new ApiError(404,"Content required for Comment");
    }
    const videoId=req.params.videoId
    console.log(videoId)
    if(!isValidObjectId(videoId)){
         throw new ApiError(400,"Invalid Video Id");
    }
    const owner=req.user._id;
    const comment=await Comment.create({
        owner:owner,
        content:content,
        video:videoId
    })
    return res.status(200)
    .json(new ApiResponse(200,comment,"Comment Succesful"))
})

const updateComment = asynchandler(async (req, res) => {
    // TODO: update a comment
    const comment=req.resource;
    const updatedcontent=req.body?.content;
    if(!updatedcontent){
        throw new ApiError(404,"Content Required");
    }
    comment.content=updatedcontent;
    const updatedcomment=await comment.save({validateBeforeSave:false});
    return res.status(200)
    .json(new ApiResponse(200,updatedcomment,"User Comment Updated Succesfully"));
})

const deleteComment = asynchandler(async (req, res) => {
    // TODO: delete a comment
    const commentId=req.resource._id;
    await Comment.findByIdAndDelete(commentId);
    return res.status(200)
    .json(new ApiResponse(200,{},"Comment Deleted Succesfully"))
})
const addReply = asynchandler(async (req, res) => {
    // TODO: add a comment to a video
    const content=req.body?.content;
    if(!content){
        throw new ApiError(404,"Content required for Comment");
    }
    const commentId=req.params.commentId
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const owner=req.user._id;
    const comment=await Comment.create({
        owner:owner,
        content:content,
        comment:commentId
    })
    return res.status(200)
    .json(new ApiResponse(200,comment,"Comment Succesful"))
})

export {
    getVideoComments, 
    addCommentVideo, 
    updateComment,
    deleteComment,
    addReply
    }