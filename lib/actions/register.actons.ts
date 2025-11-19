"use server"

import { login } from "../helpers/session";
import User from "../models/user.models";
import Usage from "../models/usage.models";
import { connectToDB } from "../mongoose";
import { compare, hash } from "bcryptjs"


export const registerUser = async (values) => {
    try {
        console.log("Registering user with values:", values);
        const { email, phone, password, name, role } = values;

        // Required fields check
        if (!email || !password || !name ) {
            throw new Error("Required fields are missing.");
        }

        await connectToDB();

        // Run all checks in parallel for maximum speed
        const [emailExists,  phoneExists] = await Promise.all([
            User.findOne({ email }).lean(),
            phone ? User.findOne({ phone }).lean() : null,
        ]);

        if (emailExists) throw new Error("A user with this email already exists.");
      
        if (phoneExists) throw new Error("Phone number already registered.");

        // Hash password (async)
        const hashedPassword = await hash(password, 12);

        // Create new user with 14-day trial
        const trialStartDate = new Date();
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialStartDate.getDate() + 14);
        
        const newUser = await User.create({
            
            fullName:name,
            email,
            phone: phone || null,
            password: hashedPassword,
            subscriptionPlan: "free",
            subscriptionStartDate: trialStartDate,
            subscriptionEndDate: trialEndDate,
            role,
        });

        // Initialize usage tracking for the new user
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        await Promise.all([
            Usage.create({
                userId: newUser._id,
                feature: 'chat',
                month: currentMonth,
                year: currentYear,
                count: 0
            }),
            Usage.create({
                userId: newUser._id,
                feature: 'prescription',
                month: currentMonth,
                year: currentYear,
                count: 0
            }),
            Usage.create({
                userId: newUser._id,
                feature: 'diagnosis',
                month: currentMonth,
                year: currentYear,
                count: 0
            })
        ]);

        // Remove password before returning
        const userData = newUser.toObject();
        delete userData.password;

        return {
            success: true,
            message: "Registration successful",
            user: JSON.parse(JSON.stringify(userData)) // Ensure no Mongoose document methods are included,
        };

    } catch (error) {
        console.error("Registration Error:", error);
        throw new Error("Something went wrong during registration.");
    }
};
export const loginUser = async (values: { email: string; password: string; rememberMe?: boolean }) => {
    try {
        const { email, password, rememberMe = true } = values;

        if (!email || !password) throw new Error("Missing fields for login");

        await connectToDB();

        const user = await User.findOne({ email }).select("+password")


        if (!user) throw new Error(`${email} not found`);

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        await login(user._id as string, user.role, rememberMe)


        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Error while logging in user", error);
        throw error;
    }
};
