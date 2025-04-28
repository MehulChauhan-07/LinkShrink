const app = require("./src/index");
const { connectToMongoDB } = require("./src/config/db");

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectToMongoDB()
  .then(() => {
    console.log("MongoDB connected successfully!");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
