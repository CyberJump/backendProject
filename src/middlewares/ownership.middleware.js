import {User} from "../models/user.models.js";
import {Video} from "../models/video.models.js"
import {Like} from "../models/like.models.js"
import {Comment} from "../models/comment.models.js"
import {Tweet} from "../models/tweet.models.js"
import {Subscription} from "../models/subscription.models.js"
import { asynchandler } from "../../utils/asynchandler.js";
import { ApiError } from "../../utils/ApiError.js";

export const verifyOwnership = ({Model, resourceId,owner="owner"}) => {
    return asynchandler(async (req, res, next) => {
        const resourceValue = req.params[resourceId];
        if (!resourceValue) {
            throw new ApiError(400, `${resourceId} is required`);
        }
        
        const resource = await Model.findById(resourceValue);
        if (!resource) {
            throw new ApiError(404, "Resource not found");
        }
        
        const ownerId = resource.owner;
        if (!ownerId.equals(req.user._id)) {
            throw new ApiError(403, "Unauthorized access");
        }

        req.resource = resource;
        next();
    });
};
