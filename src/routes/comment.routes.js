import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Comment} from "../models/comment.models.js"
import { addCommentVideo, getVideoComments, updateComment ,deleteComment, addReply} from "../controllers/comment.controller.js";
const router = Router();
router.route("/v/:videoId").get(getVideoComments);
router.route("/add/v/:videoId").post(verifyJWT,addCommentVideo);
router.route("/c/:commentId").patch(verifyJWT,verifyOwnership({Model:Comment,resourceId:"commentId"}),updateComment);
router.route("/c/:commentId").delete(verifyJWT,verifyOwnership({Model:Comment,resourceId:"commentId"}),deleteComment);
router.route("/add/c/:commentId").post(verifyJWT,addReply);
export default router