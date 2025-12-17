import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnership } from "../middlewares/ownership.middleware.js";
import {Subscription} from "../models/subscription.models.js"
import { toggleSubscription } from "../controllers/subscription.controller.js";
const router = Router();

router.route("/toggle/:channelId").post(verifyJWT,toggleSubscription);

export default router