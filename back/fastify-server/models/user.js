// Modèle User pour Fastify - Migration depuis Parse Cloud
import { v4 as uuidv4 } from 'uuid'

// Base de données mock pour le développement
const mockDatabase = {
  users: [],
  
  findAll: async () => {
    return mockDatabase.users.map(user => ({
      objectId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      is_admin: user.is_admin || false,
      is_active: user.is_active !== false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))
  },
  
  findById: async (id) => {
    const user = mockDatabase.users.find(user => user.id === id)
    if (!user) return null
    
    return {
      objectId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      is_admin: user.is_admin || false,
      is_active: user.is_active !== false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  },
  
  create: async (data) => {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = mockDatabase.users.find(user => user.email === data.email)
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà')
    }
    
    const newUser = {
      id: uuidv4(),
      ...data,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockDatabase.users.push(newUser)
    return { userId: newUser.id }
  },
  
  update: async (id, data) => {
    const index = mockDatabase.users.findIndex(user => user.id === id)
    if (index === -1) return null
    
    const updatedUser = {
      ...mockDatabase.users[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    mockDatabase.users[index] = updatedUser
    return { userId: updatedUser.id }
  },
  
  delete: async (id) => {
    const index = mockDatabase.users.findIndex(user => user.id === id)
    if (index === -1) return false
    
    mockDatabase.users.splice(index, 1)
    return true
  },
  
  changePassword: async (id, newPassword) => {
    const index = mockDatabase.users.findIndex(user => user.id === id)
    if (index === -1) return null
    
    mockDatabase.users[index].password = newPassword
    mockDatabase.users[index].updatedAt = new Date().toISOString()
    return { success: true }
  },
  
  setActiveStatus: async (id, is_active) => {
    const index = mockDatabase.users.findIndex(user => user.id === id)
    if (index === -1) return null
    
    mockDatabase.users[index].is_active = is_active
    mockDatabase.users[index].updatedAt = new Date().toISOString()
    return { success: true }
  },
  
  search: async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return mockDatabase.findAll()
    }
    
    const searchRegex = new RegExp(searchTerm, 'i')
    return mockDatabase.users
      .filter(user => 
        searchRegex.test(user.firstName) ||
        searchRegex.test(user.lastName) ||
        searchRegex.test(user.email)
      )
      .map(user => ({
        objectId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        is_admin: user.is_admin || false,
        is_active: user.is_active !== false
      }))
  }
}

export class User {
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
  
  static async delete(id) {
    return mockDatabase.delete(id)
  }
  
  static async changePassword(id, newPassword) {
    return mockDatabase.changePassword(id, newPassword)
  }
  
  static async setActiveStatus(id, is_active) {
    return mockDatabase.setActiveStatus(id, is_active)
  }
  
  static async search(searchTerm) {
    return mockDatabase.search(searchTerm)
  }
}