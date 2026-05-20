import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
dotenv.config();
const port = process.env.PORT || 5000;
const mongodbUrl = process.env.MONGODB_URL;

const connectDb = async () => {
    try {
        await mongoose.connect(mongodbUrl);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("db error")
    }
}

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL,
    },
})

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("identity", (data) => {
        console.log(data);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDb();
});