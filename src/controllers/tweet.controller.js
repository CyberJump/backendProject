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
    // TODO: get user tweets
})

const updateTweet = asynchandler(async (req, res) => {
    const tweetid=req.resource._id;
    const updatedcontent=req.body?.content;
    if(!updatedcontent){
        throw new ApiError(400,"Content Missing");
    }
    const updatedtweet=await Tweet.findByIdAndUpdate(tweetid,{
        $set:{content:updatedcontent}
    })
    return res.status(200)
    .json(new ApiResponse(200,updatedtweet,"Tweet updated succesfully"));
});

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
    const tweetid=req.resource._id;
    const deleted=await Tweet.findByIdAndDelete(tweetid);
    return res.status()
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}