import { Schema, model, models } from 'mongoose'

const DrugSearchSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  searchType: {
    type: String,
    enum: ['drug-info', 'interaction', 'dosage'],
    required: true
  },
  drugName: {
    type: String,
    required: true
  },
  result: {
    type: Schema.Types.Mixed,
    required: true
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export const DrugSearch = models.DrugSearch || model('DrugSearch', DrugSearchSchema)
