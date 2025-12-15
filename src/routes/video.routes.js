import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/Multer.middleware.js";
import { deleteVideo, getVideoById, publishAVideo, updateVideo} from "../controllers/video.controller.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Video} from "../models/video.models.js"
const router = Router();

router.route("/publish").post(verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),publishAVideo
)

router.route("/v/:videoId").get(getVideoById);
router.route("/v/:videoId").patch(verifyJWT,verifyOwnership({Model:Video,resourceId:"videoId"}),upload.single("thumbnail"),updateVideo);
router.route("/v/:videoId").delete(verifyJWT,verifyOwnership({Model:Video,resourceId:"videoId"}),deleteVideo);

export default router;