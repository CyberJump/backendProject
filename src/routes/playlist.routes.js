import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Playlist} from "../models/playlist.models.js"
import {User} from "../models/user.models.js"
import { createPlaylist } from "../controllers/playlist.controller.js";
const router = Router();
router.route("/create").post(verifyJWT,createPlaylist)


export default router