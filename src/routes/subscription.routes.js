import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Subscription} from "../models/subscription.models.js"
import {User} from "../models/user.models.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
const router = Router();

router.route("/toggle/:channelId").post(verifyJWT,toggleSubscription);
router.route("/subscribers/:channelId").get(verifyJWT,verifyOwnership({Model:User,resourceId:"channelId",owner:"_id"}),getUserChannelSubscribers);
router.route("/user/channels").get(verifyJWT,getSubscribedChannels);
export default router