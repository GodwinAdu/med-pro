"use server"

import { login } from "../helpers/session";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { compare, hash } from "bcryptjs"
import { addCoins } from "../coin-middleware";


export const registerUser = async (values) => {
    try {
        console.log("Registering user with values:", values);
        const { email, phone, password, name, role, referralCode } = values;

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

        // Handle referral code if provided
        let referrer = null;
        if (referralCode) {
            referrer = await User.findOne({ referralCode: referralCode.toLowerCase() });
        }
        
        const newUser = await User.create({
            fullName: name,
            email,
            phone: phone || null,
            password: hashedPassword,
            role,
            referredBy: referrer?._id || null,
        });

        // Handle referral rewards
        if (referrer) {
            // Update referrer count
            referrer.referralCount += 1;
            await referrer.save();
            
            // Give coins to both users
            await Promise.all([
                addCoins(referrer._id.toString(), 50, 'bonus', `Referral bonus for referring ${name}`),
                addCoins(newUser._id.toString(), 25, 'bonus', `Welcome bonus for using referral code ${referralCode}`)
            ]);
        }

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
