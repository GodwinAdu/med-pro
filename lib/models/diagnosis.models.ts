import { Schema, model, models } from 'mongoose'

const DiagnosisSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symptoms: {
    type: String,
    required: true
  },
  patientAge: String,
  medicalHistory: String,
  vitalSigns: String,
  result: {
    analysis: String,
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    differentialDiagnosis: String,
    investigations: String,
    references: String,
    disclaimer: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export const Diagnosis = models.Diagnosis || model('Diagnosis', DiagnosisSchema)
