import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Like} from "../models/like.models.js"
import { toggleVideoLike,toggleTweetLike,toggleCommentLike, getLikedVideos} from "../controllers/like.controller.js";
const router = Router();
router.route("/toggle/v/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/toggle/c/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/toggle/t/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/user/videos").get(verifyJWT,getLikedVideos);
export default router;