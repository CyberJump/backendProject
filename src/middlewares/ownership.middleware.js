// import {User} from "../models/user.models.js";
// import {Video} from "../models/video.models.js"
// import {Like} from "../models/like.models.js"
// import {Comment} from "../models/comment.models.js"
// import {Tweet} from "../models/tweet.models.js"
// import {Subscription} from "../models/subscription.models.js"
// import { asynchandler } from "../../utils/asynchandler.js";
// import { ApiError } from "../../utils/ApiError.js";
// import mongoose from "mongoose";

// export const verifyOwnership = ({
//     Model,
//     param = "id",
//     attach = "resource"
// }) =>
// asynchandler(async (req, _, next) => {
//     const resourceId = req.[param];

//     if (!mongoose.isValidObjectId(resourceId)) {
//         throw new ApiError(400, "Invalid resource id");
//     }

//     const resource = await Model.findById(resourceId);

//     if (!resource) {
//         throw new ApiError(404, "Resource not found");
//     }

//     if (!resource[ownerField]?.equals(req.user._id)) {
//         throw new ApiError(403, "Unauthorized access, not resource owner");
//     }
//     req[attach] = resource;
//     next();
// });
