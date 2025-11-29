import { Schema, model, models, Document } from "mongoose";

interface IProblemGoals {
  shortTerm: string;
  longTerm: string;
}

interface IProblem {
  number: number;
  problem: string;
  nursingDiagnosis: string;
  goals: IProblemGoals;
  interventions: string[];
  rationale: string[];
  evaluation: string[];
}

interface ICarePlan extends Document {
  userId: string;
  patientName: string;
  patientAge?: string;
  diagnosis: string;
  problems: IProblem[];
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ProblemGoalsSchema = new Schema({
  shortTerm: { type: String, required: true },
  longTerm: { type: String, required: true }
}, { _id: false });

const ProblemSchema = new Schema({
  number: { type: Number, required: true },
  problem: { type: String, required: true, trim: true },
  nursingDiagnosis: { type: String, required: true },
  goals: { type: ProblemGoalsSchema, required: true },
  interventions: [{ type: String, required: true }],
  rationale: [{ type: String, required: true }],
  evaluation: [{ type: String, required: true }]
}, { _id: false });

const CarePlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    problems: [ProblemSchema],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CarePlanSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

CarePlanSchema.index({ userId: 1, createdAt: -1 });
CarePlanSchema.index({ patientName: 1 });
CarePlanSchema.index({ diagnosis: 1 });

const CarePlan = models.CarePlan || model("CarePlan", CarePlanSchema);

export default CarePlan;