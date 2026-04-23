import mongoose from "mongoose";

const connectToDB = async () => {
  const url = process.env.MONGODB_URI;
  if (!url) {
    throw new Error("MONGODB_URI is not defined in the environment variable");
  }

  try {
    await mongoose.connect(url, {
      dbName: "Chatappmicroserviceapp",
    });
    console.log("connected to mongodb");
  } catch (error) {
    console.error("Failed to connect to mongodb", error);
    process.exit(1);
  }
};

export default connectToDB;
