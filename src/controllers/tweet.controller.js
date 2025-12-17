import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import {asynchandler} from "../../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    //TODO: create tweet
    const content=req.body?.content;
    if(!content){
        throw new ApiError(400,"Content missing for tweet");
    }
    const owner=req.user._id;
    const tweet=await Tweet.create({
        owner,
        content
    });

    return res.status(201)
    .json(new ApiResponse(201,tweet,"Tweet Created succesfully"));
})

const getUserTweets = asynchandler(async (req, res) => {
    // TODO:get user tweets
    const {page=1,limit=10,sortType="asc",userId}=req.query;
    const pipeline=[]
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"UserId missing or Invalid User Id");
    }
    // matching userId
    pipeline.push({
        $match:{
            owner:new mongoose.Types.ObjectId(userId)
        }
    })

    //sort
    pipeline.push({
        $sort:{["createdAt"]:sortType==="asc" ? 1:-1}
    })

    //lookup
    pipeline.push({
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner"
        }
    },{
        $unwind:"$owner"
    })

    //project
    pipeline.push({
        $project:{
            content:1,
            fullname:"$owner.fullname",
            avatar:"$owner.avatar.url",
            username:"$owner.username",
            createdAt:1,
            updatedAt:1
        }
    })

    const options={
        page:Number(page),
        limit:Number(limit)
    }

    const aggregate=Tweet.aggregate(pipeline);
    const tweets= await Tweet.aggregatePaginate(aggregate,options)
    return res.status(200)
    .json(new ApiResponse(200,tweets,"Tweets fetched succesfully"));
})

const updateTweet = asynchandler(async (req, res) => {
    const tweetid=req.resource._id;
    const tweet=req.resource
    const updatedcontent=req.body?.content;
    if(!updatedcontent){
        throw new ApiError(400,"Content Missing");
    }
    tweet.content=updatedcontent;
    const updatedTweet=await tweet.save({validateBeforeSave:false})
    return res.status(200)
    .json(new ApiResponse(200,updatedTweet,"Tweet updated succesfully"));
});

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
    const tweetid=req.resource._id;
    await Tweet.findByIdAndDelete(tweetid);
    return res.status(200)
    .json(new ApiResponse(204,{},"Tweet Deleted Successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}