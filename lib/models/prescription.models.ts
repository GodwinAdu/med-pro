import { Schema, model, models } from 'mongoose'

const PrescriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: String,
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: String,
  validation: {
    status: {
      type: String,
      enum: ['safe', 'warning', 'danger']
    },
    analysis: String,
    medicationCount: Number,
    fdaDataAvailable: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export const Prescription = models.Prescription || model('Prescription', PrescriptionSchema)
