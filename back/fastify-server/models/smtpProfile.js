// Modèle SMTPProfile pour Fastify - Migration depuis Parse Cloud
import { v4 as uuidv4 } from 'uuid'

// Base de données mock pour le développement
const mockDatabase = {
  smtpProfiles: [],
  
  findAll: async () => {
    return mockDatabase.smtpProfiles.filter(profile => !profile.isArchived)
  },
  
  findById: async (id) => {
    return mockDatabase.smtpProfiles.find(profile => profile.id === id)
  },
  
  create: async (data) => {
    const newProfile = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockDatabase.smtpProfiles.push(newProfile)
    return newProfile
  },
  
  update: async (id, data) => {
    const index = mockDatabase.smtpProfiles.findIndex(profile => profile.id === id)
    if (index === -1) return null
    
    const updatedProfile = {
      ...mockDatabase.smtpProfiles[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    mockDatabase.smtpProfiles[index] = updatedProfile
    return updatedProfile
  },
  
  archive: async (id) => {
    const profile = await mockDatabase.findById(id)
    if (!profile) return null
    
    return mockDatabase.update(id, {
      isArchived: true,
      isActive: false
    })
  },
  
  delete: async (id) => {
    const index = mockDatabase.smtpProfiles.findIndex(profile => profile.id === id)
    if (index === -1) return false
    
    mockDatabase.smtpProfiles.splice(index, 1)
    return true
  }
}

export class SMTPProfile {
  static async findAll() {
    return mockDatabase.findAll()
  }
  
  static async findById(id) {
    return mockDatabase.findById(id)
  }
  
  static async create(data) {
    return mockDatabase.create(data)
  }
  
  static async update(id, data) {
    return mockDatabase.update(id, data)
  }
  
  static async archive(id) {
    return mockDatabase.archive(id)
  }
  
  static async delete(id) {
    return mockDatabase.delete(id)
  }
  
  static async test(id, testEmail) {
    // Implémentation mock pour le test SMTP
    const profile = await mockDatabase.findById(id)
    if (!profile) {
      throw new Error('SMTP profile not found')
    }
    
    // Simulation d'un test SMTP réussi
    return {
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      profileId: id,
      testEmail,
      timestamp: new Date().toISOString()
    }
  }
}