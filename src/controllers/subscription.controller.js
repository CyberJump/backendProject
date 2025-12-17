import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import {asynchandler} from "../../utils/asynchandler.js";



const toggleSubscription =asynchandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId=req.user._id;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId")
    }
    let channel
    try{channel=await Subscription.findOne({
        channel:channelId,
        subscriber:userId,
    })}catch(err){
        console.log(err)
        throw new ApiError(err)
    }
    if(channel){
        await Subscription.findByIdAndDelete(channel._id)
        return res.status(200)
        .json(new ApiResponse(200,{},"Channel Unscribed succesfully"))
    }
    channel=await Subscription.create({
        subscriber:userId,
        channel:channelId
    })
    return res.status(200)
    .json(new ApiResponse(200,channel,"Channel Subscribed Succesfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers =asynchandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels =asynchandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
