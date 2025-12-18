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
        throw new ApiError(500, "Error fetching subscription")
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
    const page = req.query.page || 1;
    const pipeline=[]
    const options={
        page:Number(page),
        limit:10
    }
    pipeline.push({
        $match:{channel:new mongoose.Types.ObjectId(channelId)}
    })
    pipeline.push({
        $lookup:{
            from:"users",
            localField:"subscriber",
            foreignField:"_id",
            as:"subscribers"
        }
    })
    pipeline.push({
        $unwind:"$subscribers"
    })
    pipeline.push({
        $project:{
            channel:1,
            username:"$subscribers.username",
            fullname:"$subscribers.fullname",
            userId:"$subscribers._id",
            avatar:"$subscribers.avatar.url"
        }
    })
    const aggregate=Subscription.aggregate(pipeline)
    const subs=await Subscription.aggregatePaginate(aggregate,options);
    return res.status(200)
    .json(new ApiResponse(200,subs,"Subscribers Fetced succesfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels =asynchandler(async (req, res) => {
    const subscriberId = req.user._id;
    const page=req.query.page ||1;
    const pipeline=[]
    const options={
        page:Number(page),
        limit:10
    }
    pipeline.push({
        $match:{subscriber:new mongoose.Types.ObjectId(subscriberId)}
    })
    pipeline.push({
        $lookup:{
            from:"users",
            localField:"channel",
            foreignField:"_id",
            as:"channels",
            pipeline:[
                {
                   $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                    }
                },{
                    $addFields:{subscriberCount:{$size:"$subscribers"}}
                },{
                    $project:{
                        username:1,
                        fullname:1,
                        avatar:"$avatar.url",
                        subscriberCount:1
                    }
                }
            ]
        }
    })
    pipeline.push({
        $unwind:"$channels"
    })
    pipeline.push({
        $project:{
            username:"$channels.username",
            fullname:"$channels.fullname",
            avatar:"$channels.avatar",
            subscriberCount:"$channels.subscriberCount"
        }
    })
    const aggregate=Subscription.aggregate(pipeline)
    const channels=await Subscription.aggregatePaginate(aggregate,options);
    return res.status(200)
    .json(new ApiResponse(200,channels,"Channels Fetched Succesfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
