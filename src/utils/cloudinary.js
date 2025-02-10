import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
     
// config for cloudinary -> ye config hi jo file uploading ka permission dega.
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});



// creating e method for uploadin file for server to cloudinary. 
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; 
        //Upload the on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, { 
            resource_type: "auto"
        })
        // when the file are uploaded successfully? 
        // console.log("File is Uploded on Cloudinary", response.url)       // only for testing purpose 
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation failed!!! 
        return null
    }
}

export { uploadOnCloudinary }
