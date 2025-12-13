import { asynchandler } from "../../utils/asynchandler.js";
import {ApiError} from "../../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {DeletefromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const registerUser=asynchandler(async(req,res)=>{
    //get detailes
    //validation of details
    //check if user already exists:check by username and email
    //check for images and avatar
    //upload to cloudinary
    //create user object-create entry in Db
    //remove password and refresh token from response
    //check user creation
    //return response
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
    const {fullname,email,username,password}=req.body;

    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }
    const existeduser=await User.findOne({$or:[{username},{email}]})
    if(existeduser){
        throw new ApiError(409,"User with given username or email already exists");
    }
    const avatarlocalpath=req.files?.avatar[0]?.path;
    // const coverImagelocalpath=req.files?.coverImage[0]?.path;
    let coverImagelocalpath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagelocalpath = req.files.coverImage[0].path;
    }

    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar is required");
    }
    const avatar= await uploadOnCloudinary(avatarlocalpath);
    const coverImage= await uploadOnCloudinary(coverImagelocalpath);

    if(!avatar){
        throw new ApiError(500,"Could not upload avatar");
    }
    const user=await User.create({
        fullname,
        avatar:{url:avatar.url, publicId:avatar.public_id,assetId:avatar.asset_id},
        coverImage:{url:coverImage?.url|| "", publicId:coverImage?.public_id,assetId:coverImage?.asset_id},
        email,
        password,
        username:username.toLowerCase()

    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"Could not create user");
    }
    
    return res.status(201).json(new ApiResponse(200,createdUser,"User Registered successfully"));
})

const generateAccessandRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({ validateBeforeSave: false });
        return {accessToken,refreshToken};
    }catch(err){
        throw new ApiError(500,"Could not generate tokens");
    }
}

const loginuser=asynchandler(async(req,res)=>{
    //req body 
    //username
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password}=req.body;
    if(!(username || email)){
        throw new ApiError(400,"Username or email are required");
    }
    const user=await User.findOne({$or:[{username},{email}]});
    if(!user){
        throw new ApiError(404,"User not found");
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials");
    }
    const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
    const options={
        httpOnly:true,
        secure:true
    };
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged In successfully"));
})

const logoutUser=asynchandler(async(req,res)=>{
    //get user id
    //delete both refresh tokens and access tokens
    const userId=req.user._id;
    await User.findByIdAndUpdate(userId,{
        $set:{refreshToken:undefined}},
        {new:true}
    );
    const options={
        httpOnly:true,
        secure:true,}
    return res.status(200).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"User logged out successfully"));
})


const refreshAccessToken=asynchandler(async(req,res)=>{
    //get refresh token via cookie

    const incomingRefreshToken=req.cookies?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized access,token missing");
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError("401","Invalid refresh token,user not found");
        }
        if(user?.refreshToken!==incomingRefreshToken){
            throw new ApiError("401","Refresh token is expired or used");
        }
        const options={
            httpOnly:true,
            secure:true,
        };
        const {accessToken,newrefreshToken}=await generateAccessandRefreshToken(user._id);
        return res.status(200).
        cookie("accessToken",accessToken,options).
        cookie("refreshToken",newrefreshToken,options).
        json(new ApiResponse(200,{accessToken,newrefreshToken},"Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401,error?.message || "Unauthorized access,invalid token");
    }
})

const changeCurrentPassword=asynchandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Old password is incorrect");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"));
})

const getCurrentUser=asynchandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current User fetched succesfully"));
})

const updateAccountDetails=asynchandler(async(req,res)=>{
    const {fullname,username,email}=req.body;
    
    if(!(fullname || username || email)){
        throw new ApiError(400,"Atleast one field is required to update");
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{fullname,username,email}
    },{new:true}).select("-password -refreshToken")

    return res.status(200).
    json(new ApiResponse(200,user,"User details updated successfully"));
})

const UpdateUserAvatar=asynchandler(async(req,res)=>{
    const avatarlocalpath=req.file?.path;
    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar is required");
    }
    const avatar=await uploadOnCloudinary(avatarlocalpath);
    if(!avatar){
        throw new ApiError(500,"Could not upload avatar");
    }
    const user=await User.findById(req.user?._id);
    const prevavatarpublicid=user.avatar.publicId;
    await DeletefromCloudinary(prevavatarpublicid);
    const updateduser=await User.findByIdAndUpdate(req.user?._id,{
        $set:{avatar:{url:avatar.url,publicId:avatar.public_id,assetId:avatar.asset_id}}
    },{new:true}).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,updateduser,"User Avatar Image updated successfully"));
});

const UpdateUserCover=asynchandler(async(req,res)=>{
    const coverlocalpath=req.file?.path;
    if(!coverlocalpath){
        throw new ApiError(400,"cover is required");
    }
    const cover=await uploadOnCloudinary(coverlocalpath);
    if(!cover){
        throw new ApiError(500,"Could not upload cover");
    }
    const user=await User.findById(req.user?._id);
    const prevcoverpublicid=user.coverImage.publicId;
    await DeletefromCloudinary(prevcoverpublicid);
    const updateduser=await User.findByIdAndUpdate(req.user?._id,{
        $set:{coverImage:{url:cover.url,publicId:cover.public_id,assetId:cover.asset_id}}
    },{new:true}).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,updateduser,"User Cover Image updated successfully"));
});

const getUserChannelProfile=asynchandler(async(req,res)=>{
    const {username}=req.params;
    if(!username?.trim()){
        throw new ApiError(400,"Username is required");
    }
    const channel=await User.aggregate([
        {
            $match:{username:username?.toLowerCase()}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelssubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelssubscribedToCount:1,
                avatar:1,
                coverImage:1,
                email:1,
                isSubscribed:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
});

const getWatchHistory= asynchandler(async(req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[{
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"watch history fetched succesfully")
    )
})

const DeleteUser=asynchandler(async(req,res)=>{
    const avatarId=req.user.avatar.publicId;
    const coverId=req.user.coverImage.publicId
   try{
    await User.findByIdAndDelete(req.user?._id);}catch(err){
        throw new ApiError(err)
   }
    await DeletefromCloudinary(avatarId);
    console.log("avatar deleted");
    await DeletefromCloudinary(coverId);
    console.log("cover deleted");
    return res.status(200).json(new ApiResponse(200,{},"User Deleted Succesfully"));
})




export {
    registerUser,
    loginuser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    UpdateUserAvatar,
    UpdateUserCover,
    getUserChannelProfile,
    getWatchHistory,
    DeleteUser
};

