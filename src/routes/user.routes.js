import { Router } from "express";                                           // import express !!!
import { registerUser } from "../controllers/user.controller.js";           // import registerUser function from controller !!!
import { upload } from "../middlewares/multer.middleware.js";               // import Multer(file upload) from middleware folder!!!


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





export default router;