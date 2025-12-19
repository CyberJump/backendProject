import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import {asynchandler} from "../../utils/asynchandler.js"

const createPlaylist = asynchandler(async (req, res) => {
    console.log(req.body)
    const {name, description} = req.body
    //TODO: create playlist
    if(!(name)){
        throw new ApiError(400,"Name of playlist Required");
    }
    const newPlaylist=await Playlist.create({
        name:name,
        description:description,
        owner:req.user._id
    })
    return res.status(201)
    .json(new ApiResponse(201,newPlaylist,"Playlist Generated"));
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const userId=req.user._id;
    const playlists= await Playlist.find({owner:new mongoose.Types.ObjectId(userId)});
    return res.status(200)
    .json(new ApiResponse(200,playlists,"All playlists fetched succesfully"));
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId");
    }
    const playlist=await Playlist.aggregate([{
        $match:{"_id":new mongoose.Types.ObjectId(playlistId)}
    },{
        $lookup:{
            from:"videos",
            localField:"videos",
            foreignField:"_id",
            as:"videos",
            pipeline:[{
                $project:{
                    thumbnail:"$thumbnail.url",
                    video:"$videoFile.url",
                    views:1,
                    title:1,
                    description:1,
                    duration:1
                }
            }]
        },
    }])
    if(!playlist || playlist.length === 0){
        throw new ApiError(404,"Playlist not found");
    }
    return res.status(200).
    json(new ApiResponse(200,playlist[0],"Playlist Fetched"))
})


const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!(playlistId && videoId)){
        throw new ApiError(400,"PlaylistId or VideoId needed");
    }
    const playlist=req.resource;
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video Already In Playlist")
    }
    playlist.videos.push(videoId);
    const updatedplaylist=await playlist.save({validateBeforeSave:false});
    return res.status(201)
    .json(new ApiResponse(200,updatedplaylist,"Video Added"));
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!(isValidObjectId(videoId))){
        throw new ApiError(400,"Valid Object required");
    }
    if(!req.resource.videos.includes(videoId)){
        throw new ApiError(404,"Video Not Found")
    }
    const updatePlaylist= await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{videos:videoId}
    })
    return res.status(200)
    .json(new ApiResponse(200,updatePlaylist,"Video Deleted Succesfully"));
})

const deletePlaylist = asynchandler(async (req, res) => {
    console.log()
    await Playlist.findByIdAndDelete(req.resource._id);
    return res.status(200)
    .json(new ApiResponse(200,{},"Playlist Deleted succesfully"))
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {name, description} = req.body
    if(!(name || description)){
        throw new ApiError(404,"Atleast One Field required");
    }
    const playlist=req.resource;
    if(name){
        playlist.name=name;
    }
    if(description){
        playlist.description=description;
    }
    const updatedPlaylist=await playlist.save({validateBeforeSave:false})
    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Playlist Updated Succesfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}