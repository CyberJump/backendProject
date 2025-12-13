import {Router} from "express";
import {registerUser,loginuser,logoutUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, UpdateUserAvatar, UpdateUserCover, getUserChannelProfile, getWatchHistory, DeleteUser} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/Multer.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);

router.route("/login").post(loginuser);

//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),UpdateUserAvatar);
router.route("cover-image").patch(verifyJWT,upload.single("coverImage"),UpdateUserCover);
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);
router.route("/delete").post(verifyJWT,DeleteUser);
export default router; 