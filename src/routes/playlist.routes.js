import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Playlist} from "../models/playlist.models.js"
import {User} from "../models/user.models.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const router = Router();
router.route("/create").post(verifyJWT,createPlaylist)
router.route("/user/all").get(verifyJWT,getUserPlaylists);
router.route("/p/:playlistId").get(verifyJWT,getPlaylistById);
router.route("/p/:playlistId/add/:videoId").post(verifyJWT,verifyOwnership({Model:Playlist,resourceId:"playlistId"}),addVideoToPlaylist)
router.route("/p/:playlistId/v/:videoId").delete(verifyJWT,verifyOwnership({Model:Playlist,resourceId:"playlistId"}),removeVideoFromPlaylist);
router.route("/p/:playlistId").delete(verifyJWT,verifyOwnership({Model:Playlist,resourceId:"playlistId"}),deletePlaylist);
router.route("/p/:playlistId").patch(verifyJWT,verifyOwnership({Model:Playlist,resourceId:"playlistId"}),updatePlaylist);
export default router