import cloudinary from "cloudinary";
import 'dotenv/config'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

console.log(cloudinary.config());

export const uploadImage = async (imagePath) => {

    const options = {
        use_filename: false,
        unique_filename: true,
        overwrite: false
    };

    try { 
        const result = await cloudinary.uploader.upload(imagePath, options);
        console.log(result);
        return result.public_id;
    } catch (error) {
        console.error(error);
    }

};

export const getAssetInfo = async (publicId) => {
    const options = {
        colors: true
    };

    try {
        const result = await cloudinary.api.resource(publicId, options);
        console.log(result);
        return result.colors;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteUploadedFiles(ids) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return;
  }

  try {
    for (const id of ids) {
      const result = await cloudinary.uploader.destroy(id);
      console.log(result);
      console.log('Deleted file public_id: ', id);
    }
  } catch (err) {
    console.error('Error deleting uploaded files:', err);
  }
}
