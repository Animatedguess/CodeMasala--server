import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/Manu`);
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    }
    catch(err){
        console.log('MongoDB Error:\n', err);
        process.exit(1);
    }
};

export default connectDB;