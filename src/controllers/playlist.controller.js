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
    
    
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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