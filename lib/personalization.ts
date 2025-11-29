import UserPreferences from './models/preferences.models'
import { connectToDB } from './mongoose'

export class PersonalizationService {
  static async trackDrugUsage(userId: string, drugName: string) {
    await connectToDB()
    
    await UserPreferences.findOneAndUpdate(
      { userId },
      {
        $inc: { 'frequentDrugs.$[elem].count': 1 },
        $set: { 'frequentDrugs.$[elem].lastUsed': new Date() }
      },
      {
        arrayFilters: [{ 'elem.name': drugName }],
        upsert: false
      }
    )

    // If drug not found, add it
    await UserPreferences.findOneAndUpdate(
      { userId, 'frequentDrugs.name': { $ne: drugName } },
      {
        $push: {
          frequentDrugs: {
            name: drugName,
            count: 1,
            lastUsed: new Date()
          }
        }
      },
      { upsert: true }
    )
  }

  static async addSearchHistory(userId: string, query: string, type: 'drug' | 'condition' | 'prescription') {
    await connectToDB()
    
    await UserPreferences.findOneAndUpdate(
      { userId },
      {
        $push: {
          searchHistory: {
            $each: [{ query, type, timestamp: new Date() }],
            $slice: -50 // Keep only last 50 searches
          }
        }
      },
      { upsert: true }
    )
  }

  static async getFrequentDrugs(userId: string, limit = 10) {
    await connectToDB()
    
    const prefs = await UserPreferences.findOne({ userId })
    if (!prefs) return []
    
    return prefs.frequentDrugs
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  static async getRecentSearches(userId: string, limit = 10) {
    await connectToDB()
    
    const prefs = await UserPreferences.findOne({ userId })
    if (!prefs) return []
    
    return prefs.searchHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  static async savePrescriptionTemplate(userId: string, name: string, medications: any[]) {
    await connectToDB()
    
    await UserPreferences.findOneAndUpdate(
      { userId },
      {
        $push: {
          prescriptionTemplates: {
            name,
            medications,
            createdAt: new Date()
          }
        }
      },
      { upsert: true }
    )
  }

  static async getPrescriptionTemplates(userId: string) {
    await connectToDB()
    
    const prefs = await UserPreferences.findOne({ userId })
    return prefs?.prescriptionTemplates || []
  }

  static async updateQuickAction(userId: string, action: string) {
    await connectToDB()
    
    await UserPreferences.findOneAndUpdate(
      { userId },
      {
        $inc: { 'quickActions.$[elem].priority': 1 },
        $set: { 'quickActions.$[elem].lastUsed': new Date() }
      },
      {
        arrayFilters: [{ 'elem.action': action }],
        upsert: false
      }
    )

    // If action not found, add it
    await UserPreferences.findOneAndUpdate(
      { userId, 'quickActions.action': { $ne: action } },
      {
        $push: {
          quickActions: {
            action,
            priority: 1,
            lastUsed: new Date()
          }
        }
      },
      { upsert: true }
    )
  }

  static async getPersonalizedSuggestions(userId: string) {
    await connectToDB()
    
    const prefs = await UserPreferences.findOne({ userId })
    if (!prefs) return { drugs: [], searches: [], templates: [] }
    
    const frequentDrugs = prefs.frequentDrugs
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    const recentSearches = prefs.searchHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
    
    const templates = prefs.prescriptionTemplates
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
    
    return {
      drugs: frequentDrugs,
      searches: recentSearches,
      templates
    }
  }
}