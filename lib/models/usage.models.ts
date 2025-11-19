import { Schema, model, models, Document } from "mongoose";

interface IUsage extends Document {
    userId: string;
    feature: "chat" | "prescription" | "diagnosis";
    month: number;
    year: number;
    count: number;
    createdAt: Date;
    updatedAt: Date;
}

const UsageSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        feature: {
            type: String,
            enum: ["chat", "prescription", "diagnosis"],
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        count: {
            type: Number,
            default: 0,
            min: 0,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

UsageSchema.index({ userId: 1, feature: 1, month: 1, year: 1 }, { unique: true });

UsageSchema.statics.incrementUsage = async function(userId: string, feature: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    return await this.findOneAndUpdate(
        { userId, feature, month, year },
        { $inc: { count: 1 }, updatedAt: new Date() },
        { upsert: true, new: true }
    );
};

UsageSchema.statics.getCurrentUsage = async function(userId: string, feature: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const usage = await this.findOne({ userId, feature, month, year });
    return usage?.count || 0;
};

const Usage = models.Usage || model("Usage", UsageSchema);

export default Usage;