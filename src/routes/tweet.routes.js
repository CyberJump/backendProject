import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {createTweet, deleteTweet, updateTweet} from "../controllers/tweet.controller.js";
import {Tweet} from "../models/tweet.models.js"
const router = Router();

router.route("/publish/").post(verifyJWT,createTweet);
router.route("/:tweetId").patch(verifyJWT,verifyOwnership({Model:Tweet,resourceId:"tweetId"}),updateTweet);
router.route("/:tweetId").delete(verifyJWT,verifyOwnership({Model:Tweet,resourceId:"tweetId"}),deleteTweet);
export default router