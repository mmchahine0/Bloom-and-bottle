import express from "express";
import connectDB from "./database/mongoClient";

const app = express();
app.use(express.json());

connectDB();

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
