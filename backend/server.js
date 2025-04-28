require("dotenv").config();
const http = require("http");

const { connectToMongoDB } = require("./src/config/db");

// const app = express();
const app = require("./src/index");
const server = http.createServer(app);

connectToMongoDB()
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });


const PORT = process.env.PORT;
server.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
  console.log(
    `Server running in ${process.env.BACKEND_URL} mode on port ${PORT}`
  );
});
