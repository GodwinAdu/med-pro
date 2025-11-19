"use server"

import User from "../models/user.models";
import { connectToDB } from "../mongoose";

export async function fetchUserById(userId: string) {
    try {
        await connectToDB();

        const user = await User.findById(userId).select("-password").lean();

        if (!user) {
            throw new Error("User not found.");
        }
        return JSON.parse(JSON.stringify(user)); // Ensure no Mongoose document methods are included
    } catch (error) {
        console.error("Fetch User Error:", error);
        throw error
    }
}