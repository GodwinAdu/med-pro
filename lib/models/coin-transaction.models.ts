import { Schema, model, models, Document } from "mongoose";

export interface ICoinTransaction extends Document {
    userId: string;
    type: "purchase" | "usage" | "bonus" | "refund";
    amount: number;
    description: string;
    feature?: "chat" | "diagnosis" | "prescription" | "care-plan" | "drug-search" | "voice-tts" | "voice-stt" | "notes";
    paystackReference?: string;
    balanceAfter: number;
    createdAt: Date;
}

const CoinTransactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["purchase", "usage", "bonus", "refund"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        feature: {
            type: String,
            enum: ["chat", "diagnosis", "prescription", "care-plan", "drug-search", "voice-tts", "voice-stt", "notes"],
        },

        paystackReference: {
            type: String,
        },

        balanceAfter: {
            type: Number,
            required: true,
        },

        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

CoinTransactionSchema.index({ userId: 1, createdAt: -1 });
CoinTransactionSchema.index({ type: 1 });

const CoinTransaction = models.CoinTransaction || model("CoinTransaction", CoinTransactionSchema);

export default CoinTransaction;