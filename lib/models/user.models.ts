import { Schema, model, models, Query, Document } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role: "doctor" | "nurse";
    isActive: boolean;
    isDeleted: boolean;
    coinBalance: number;
    totalCoinsEarned: number;
    totalCoinsSpent: number;
    lastDailyBonus?: Date;
    paystackCustomerId?: string;
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

        coinBalance: {
            type: Number,
            default: 20, // New users get 20 free coins
        },

        totalCoinsEarned: {
            type: Number,
            default: 20,
        },

        totalCoinsSpent: {
            type: Number,
            default: 0,
        },

        referralCode: {
            type: String,
            unique: true,
            sparse: true,
        },

        referredBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        referralCount: {
            type: Number,
            default: 0,
        },

        lastDailyBonus: { type: Date },
        
        paystackCustomerId: { type: String },

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

UserSchema.pre(/^find/, function () {
    (this as Query<IUser[], IUser>).find({ isDeleted: false });
});

UserSchema.pre("save", function () {
    this.updatedAt = new Date();
    
    // Generate referral code if new user
    if (this.isNew && !this.referralCode) {
        this.referralCode = this.fullName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 4);
    }
});

UserSchema.methods.canAfford = function (cost: number) {
    return this.coinBalance >= cost;
};

UserSchema.methods.deductCoins = function (cost: number) {
    if (this.coinBalance >= cost) {
        this.coinBalance -= cost;
        this.totalCoinsSpent += cost;
        return true;
    }
    return false;
};

UserSchema.methods.addCoins = function (amount: number) {
    this.coinBalance += amount;
    this.totalCoinsEarned += amount;
};

UserSchema.methods.canClaimDailyBonus = function () {
    if (!this.lastDailyBonus) return true;
    const today = new Date();
    const lastBonus = new Date(this.lastDailyBonus);
    return today.toDateString() !== lastBonus.toDateString();
};

UserSchema.methods.claimDailyBonus = function () {
    if (this.canClaimDailyBonus()) {
        this.addCoins(2);
        this.lastDailyBonus = new Date();
        return true;
    }
    return false;
};

UserSchema.index({ email: 1 });
UserSchema.index({ coinBalance: 1 });

const User = models.User || model("User", UserSchema);

export default User;