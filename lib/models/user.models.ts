import { Schema, model, models, Query, Document } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role: "doctor" | "nurse";
    isActive: boolean;
    isDeleted: boolean;
    subscriptionPlan: "free" | "basic" | "pro";
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    trialStartDate?: Date;
    trialEndDate?: Date;
    paystackCustomerId?: string;
    paystackSubscriptionCode?: string;
    lastLoginAt?: Date;
    lastLogoutAt?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        phone: {
            type: String,
            trim: true,
        },

        role: {
            type: String,
            enum: ["doctor", "nurse"],
            default: null,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        subscriptionPlan: {
            type: String,
            enum: ["free", "basic", "pro"],
            default: "free",
        },

        subscriptionStartDate: { type: Date },
        subscriptionEndDate: { type: Date },
        
        trialStartDate: { type: Date },
        trialEndDate: { type: Date },
        
        paystackCustomerId: { type: String },
        paystackSubscriptionCode: { type: String },

        lastLoginAt: { type: Date },
        lastLogoutAt: { type: Date },

        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

UserSchema.pre(/^find/, function (next) {
    (this as Query<IUser[], IUser>).find({ isDeleted: false });
    next();
});

UserSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    if (this.isNew && this.subscriptionPlan === "free") {
        this.trialStartDate = new Date();
        this.trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
    next();
});

UserSchema.methods.isTrialActive = function () {
    if (!this.trialEndDate) return false;
    return this.trialEndDate > new Date();
};

UserSchema.methods.isTrialExpired = function () {
    if (!this.trialEndDate) return true;
    return this.trialEndDate <= new Date();
};

UserSchema.methods.canAccessFeatures = function () {
    if (this.subscriptionPlan === "pro") return true;
    if (this.subscriptionPlan === "basic") return true;
    if (this.subscriptionPlan === "free") return this.isTrialActive();
    return false;
};

UserSchema.methods.getUsageLimits = function () {
    switch (this.subscriptionPlan) {
        case "pro":
            return { chatMessages: -1, prescriptions: -1, diagnoses: -1 };
        case "basic":
            return { chatMessages: 100, prescriptions: 20, diagnoses: 10 };
        case "free":
            return this.isTrialActive() 
                ? { chatMessages: 10, prescriptions: 5, diagnoses: 3 }
                : { chatMessages: 0, prescriptions: 0, diagnoses: 0 };
        default:
            return { chatMessages: 0, prescriptions: 0, diagnoses: 0 };
    }
};

UserSchema.index({ email: 1 });

const User = models.User || model("User", UserSchema);

export default User;