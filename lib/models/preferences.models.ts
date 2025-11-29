import { Schema, model, models } from "mongoose"

export interface IUserPreferences {
  userId: string
  frequentDrugs: Array<{
    name: string
    count: number
    lastUsed: Date
  }>
  searchHistory: Array<{
    query: string
    type: 'drug' | 'condition' | 'prescription'
    timestamp: Date
  }>
  prescriptionTemplates: Array<{
    name: string
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      duration: string
    }>
    createdAt: Date
  }>
  quickActions: Array<{
    action: string
    priority: number
    lastUsed: Date
  }>
  notifications: {
    medicationReminders: boolean
    appointmentAlerts: boolean
    healthTips: boolean
    emergencyAlerts: boolean
  }
  workflowPreferences: {
    defaultPrescriptionDuration: string
    preferredUnits: 'metric' | 'imperial'
    autoSaveInterval: number
    darkMode: boolean
  }
}

const UserPreferencesSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  
  frequentDrugs: [{
    name: String,
    count: { type: Number, default: 1 },
    lastUsed: { type: Date, default: Date.now }
  }],
  
  searchHistory: [{
    query: String,
    type: { type: String, enum: ['drug', 'condition', 'prescription'] },
    timestamp: { type: Date, default: Date.now }
  }],
  
  prescriptionTemplates: [{
    name: String,
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  
  quickActions: [{
    action: String,
    priority: { type: Number, default: 0 },
    lastUsed: { type: Date, default: Date.now }
  }],
  
  notifications: {
    medicationReminders: { type: Boolean, default: true },
    appointmentAlerts: { type: Boolean, default: true },
    healthTips: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true }
  },
  
  workflowPreferences: {
    defaultPrescriptionDuration: { type: String, default: '7 days' },
    preferredUnits: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    autoSaveInterval: { type: Number, default: 30 },
    darkMode: { type: Boolean, default: false }
  }
}, {
  timestamps: true
})

const UserPreferences = models.UserPreferences || model('UserPreferences', UserPreferencesSchema)
export default UserPreferences