import { Router } from "express";                                           // import express !!!
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";           // import registerUser function from controller !!!
import { upload } from "../middlewares/multer.middleware.js";               // import Multer(file upload) from middleware folder!!!
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();                                                    // create router object!!!

//REGISTRATION ROUTE
router.route("/register").post(                                             //create router with help of route method!!!
        upload.fields([
            {
                name: "avatar", 
                maxCount: 1
            }, 
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser,
) 

// Login Route 
router.route("/login").post(loginUser)


// //JWT  secure routSe.
// logout  route.
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh_token").post(refreshAccessToken);



export default router;