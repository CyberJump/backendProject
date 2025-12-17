import mongoose from "mongoose"; 
import {asynchandler} from "../../utils/asynchandler.js";
import {ApiResponse} from "../../utils/ApiResponse.js";
import {ApiError} from "../../utils/ApiError.js";
import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {DeletefromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";


const getAllVideos = asynchandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId
  } = req.query;

  const pipeline = [];

  //Search by title
  if (query) {
    pipeline.push({
      $match: {
        title: { $regex: query, $options: "i" }
      }
    });
  }

  //Filter by owner
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    });
  }

  //check sort items 
  const allowedSortFields = ["createdAt", "views", "duration"];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  //Sort
  pipeline.push({
    $sort: {
      [sortBy]: sortType === "asc" ? 1 : -1
    }
  });

  //Lookup owner
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    {
      $unwind: "$owner"
    },
    {
      $project: {
        title: 1,
        duration: 1,
        views: 1,
        thumbnail: 1,
        videoFile: 1,
        createdAt: 1,
        owner: {
          username: "$owner.username",
          fullname: "$owner.fullname",
          avatar: "$owner.avatar"
        }
      }
    }
  );

  const options = {
    page: Number(page),
    limit: Number(limit)
  };

  const aggregate = await Video.aggregate(pipeline);
  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All Videos Fetched Successfully"));
});

const publishAVideo = asynchandler(async (req, res) => {
    //get the video files and thumbnail 
    //get title,description
    //check if all of them are present or not
    //upload to cloudinary
    //check for if its availaible
    //send response with url
    const { title, description} = req.body
    if(!(title && description)){
        throw new ApiError(409,"Title and description Required!");
    }
    if(!(req.files && Array.isArray(req.files.thumbnail)&& Array.isArray(req.files.videoFile) && req.files.thumbnail.length>0 && req.files.videoFile.length>0)){
        throw new ApiError(400,"Video and Thumbail are required");
    }
    const videolocalpath=req.files.videoFile[0].path;
    const thumbnailpath=req.files.thumbnail[0].path;
    const user=req.user;
    const videoup=await uploadOnCloudinary(videolocalpath);
    console.log("Video uploaded");
    const thumbnail=await uploadOnCloudinary(thumbnailpath);
    console.log("Thumbnail uploaded");
    if(!(videoup && thumbnail)){
        throw new ApiError(500,"Couldnt Upload video/thumbnail");
    }
    const video=await Video.create({
        title,
        description,
        videoFile:{url:videoup.url,publicId:videoup.public_id},
        thumbnail:{url:thumbnail.url,publicId:thumbnail.public_id},
        owner:user._id,
        duration:videoup.duration
    })
    console.log(video)
    return res.status(201).json(new ApiResponse(201,video,"Video Published Successfully"));
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video Not found");
    }
    if(!video.isPublished){
        throw new ApiError(403,"Video Not Published");
    }
    video.views=video.views+1;
    await video.save({validateBeforeSave:false})
    return res.status(200).
    json(new ApiResponse(200,video,"Video Fetched Succesfully"));
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    console.log(req.body)
    const thumbnailpath=req.file?.path;
    const title=req.body?.title;
    const description=req.body?.description;
    const updatedthumbnail=await uploadOnCloudinary(thumbnailpath);
    if(!(updatedthumbnail || title || description)){
        throw new ApiError(409,"Atleast One field required");
    }
    console.log(req.resource)
    const oldthumbnailId=req.resource.thumbnail.publicId;
    let updatedvideo;
    if(updatedthumbnail){
        updatedvideo=await Video.findByIdAndUpdate(videoId,{
        $set:{title,description,thumbnail:{url:updatedthumbnail?.url,publicId:updatedthumbnail?.public_id}}},{new:true})
        DeletefromCloudinary(oldthumbnailId);
    }
    else{
        updatedvideo=await Video.findByIdAndUpdate(videoId,{
        $set:{title,description}},{new:true})
    }
    return res.status(200)
    .json(new ApiResponse(201,updatedvideo,"Video Succesfully Updated"));
})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const thumbnailpublicId=req.resource.thumbnail.publicId;
    const videopublicId=req.resource.videoFile.publicId;
    await Video.findByIdAndDelete(videoId);
    await DeletefromCloudinary(thumbnailpublicId);
    await DeletefromCloudinary(videopublicId);
    console.log("video deleted succesfully");
    return res.status(204).json(new ApiResponse(204,{},"Video Deleted succesfully"));
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const videoId=req.resource._id;
    const publishstatus=req.resource.isPublished;
    let updatedvideo
    if(publishstatus){
        updatedvideo=await Video.findByIdAndUpdate(videoId,{
            $set:{isPublished:false}
        })
    }
    else{
        updatedvideo=await Video.findByIdAndUpdate(videoId,{
            $set:{isPublished:true}
        })
    }
    return res.status(200)
    .json(new ApiResponse(200,updatedvideo,"Publish status changed"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}