import { v2 as cloudnery } from "cloudinary"
import fs from "fs"

cloudnery.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null
        }
        // upload the file on cloudinary
        const res = await cloudnery.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // console.log("File is uploaded on cloudinary :) - ", res.url);
        fs.unlinkSync(localFilePath); // for delete the local storage files
        return res;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload operation got failed
        console.log("Error while uploading file on cloudinary - ", error);
        return null;
    }
}

export { uploadOnCloudinary }
