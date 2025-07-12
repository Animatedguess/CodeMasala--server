import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        // upload the file on Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        fs.unlinkSync(localFilePath)
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteOnCloudinary = async function(localFilePath, fileType){
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.destroy(localFilePath, { resource_type: fileType || 'image' }, function(error, result) {
            if (error) {
              console.error('Error deleting image:', error);
            } else {
              console.log('Image deleted:', result);
            }
        })
        return response;
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong at the time of deletion");
    }
}

export {
    uploadOnCloudinary,
    deleteOnCloudinary
}