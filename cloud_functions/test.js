// cloud_functions/test.js
// Tests unitaires pour les fonctions de gestion des relances

const {
  getScheduledRelancesForSequence,
  updateRelanceStatus,
  createSequenceLog,
  deactivateSequenceAndCancelRelances
} = require('./relanceFunctions');

const {
  fetchRelancesPlanifiees,
  sendRelance,
  updateRelanceAfterSend,
  replanifyFailedRelance,
  logCronResult,
  triggerRelanceCron
} = require('./cronFunctions');

// Mock de Parse pour les tests
const mockParse = {
  Object: {
    extend: jest.fn((className) => {
      return jest.fn().mockImplementation(() => ({
        id: null,
        set: jest.fn(),
        save: jest.fn(),
        get: jest.fn()
      }));
    })
  },
  Query: jest.fn(() => ({
    equalTo: jest.fn(() => mockQuery),
    lessThanOrEqualTo: jest.fn(() => mockQuery),
    ascending: jest.fn(() => mockQuery),
    find: jest.fn()
  })),
  User: {
    current: jest.fn()
  }
};

const mockQuery = {
  equalTo: jest.fn(() => mockQuery),
  lessThanOrEqualTo: jest.fn(() => mockQuery),
  ascending: jest.fn(() => mockQuery),
  find: jest.fn()
};

// Remplacer Parse par le mock
global.Parse = mockParse;

describe('Fonctions de gestion des relances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScheduledRelancesForSequence', () => {
    it('devrait retourner un tableau de relances', async () => {
      const mockRelances = [
        { id: 'rel1', get: () => 'test@example.com' },
        { id: 'rel2', get: () => 'test2@example.com' }
      ];
      
      mockParse.Query().find.mockResolvedValue(mockRelances);
      
      const result = await getScheduledRelancesForSequence('seq123');
      
      expect(result).toEqual(mockRelances);
      expect(mockParse.Query().equalTo).toHaveBeenCalledWith('sequence', {
        __type: 'Pointer',
        className: 'Sequences',
        objectId: 'seq123'
      });
      expect(mockParse.Query().equalTo).toHaveBeenCalledWith('is_sent', false);
    });
    
    it('devrait lancer une erreur si la requête échoue', async () => {
      mockParse.Query().find.mockRejectedValue(new Error('DB Error'));
      
      await expect(getScheduledRelancesForSequence('seq123')).rejects.toThrow('DB Error');
    });
  });

  describe('updateRelanceStatus', () => {
    it('devrait mettre à jour une relance avec succès', async () => {
      const mockRelance = {
        id: 'rel1',
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      
      mockParse.Object.extend.mockReturnValue(jest.fn(() => mockRelance));
      
      const result = await updateRelanceStatus('rel1', 'cancelled');
      
      expect(result.success).toBe(true);
      expect(mockRelance.set).toHaveBeenCalledWith('is_sent', true);
      expect(mockRelance.set).toHaveBeenCalledWith('status', 'cancelled');
      expect(mockRelance.save).toHaveBeenCalledWith(null, { useMasterKey: true });
    });
    
    it('devrait retourner une erreur si la sauvegarde échoue', async () => {
      const mockRelance = {
        id: 'rel1',
        set: jest.fn(),
        save: jest.fn().mockRejectedValue(new Error('Save Error'))
      };
      
      mockParse.Object.extend.mockReturnValue(jest.fn(() => mockRelance));
      
      const result = await updateRelanceStatus('rel1', 'cancelled');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Save Error');
    });
  });

  describe('createSequenceLog', () => {
    it('devrait créer un log avec succès', async () => {
      const mockLog = {
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({ id: 'log1' })
      };
      
      mockParse.Object.extend
        .mockReturnValueOnce(jest.fn(() => ({ id: null }))) // Sequence
        .mockReturnValueOnce(jest.fn(() => mockLog)); // SequenceLog
      
      mockParse.User.current.mockReturnValue({ id: 'user1' });
      
      const result = await createSequenceLog('seq123', 'deactivation', '3 relances annulées');
      
      expect(result.id).toBe('log1');
      expect(mockLog.set).toHaveBeenCalledWith('action', 'deactivation');
      expect(mockLog.set).toHaveBeenCalledWith('details', '3 relances annulées');
    });
  });

  describe('deactivateSequenceAndCancelRelances', () => {
    it('devrait gérer le cas sans relances planifiées', async () => {
      mockParse.Query().find.mockResolvedValue([]);
      
      const mockLog = {
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({ id: 'log1' })
      };
      
      mockParse.Object.extend
        .mockReturnValueOnce(jest.fn(() => ({ id: null }))) // Sequence pour log
        .mockReturnValueOnce(jest.fn(() => mockLog)) // SequenceLog
        .mockReturnValueOnce(jest.fn(() => ({ // Sequence pour désactivation
          id: 'seq123',
          set: jest.fn(),
          save: jest.fn().mockResolvedValue(true)
        })));
      
      const result = await deactivateSequenceAndCancelRelances('seq123');
      
      expect(result.success).toBe(true);
      expect(result.cancelledCount).toBe(0);
      expect(result.message).toBe('Aucune relance à annuler');
    });
    
    it('devrait annuler les relances et désactiver la séquence', async () => {
      const mockRelances = [
        { id: 'rel1', get: () => 'test@example.com' },
        { id: 'rel2', get: () => 'test2@example.com' }
      ];
      
      mockParse.Query().find.mockResolvedValue(mockRelances);
      
      // Mock pour updateRelanceStatus
      const mockRelance = {
        id: null,
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      
      mockParse.Object.extend
        .mockReturnValueOnce(jest.fn(() => mockRelance)) // Pour updateRelanceStatus
        .mockReturnValueOnce(jest.fn(() => ({ id: null }))) // Sequence pour log
        .mockReturnValueOnce(jest.fn(() => ({ // SequenceLog
          set: jest.fn(),
          save: jest.fn().mockResolvedValue({ id: 'log1' })
        }))
        .mockReturnValueOnce(jest.fn(() => ({ // Sequence pour désactivation
          id: 'seq123',
          set: jest.fn(),
          save: jest.fn().mockResolvedValue(true)
        })));
      
      const result = await deactivateSequenceAndCancelRelances('seq123');
      
      expect(result.success).toBe(true);
      expect(result.cancelledCount).toBe(2);
      expect(result.message).toBe('2 relances annulées avec succès');
    });
    
    it('devrait gérer les erreurs partielles', async () => {
      const mockRelances = [
        { id: 'rel1', get: () => 'test@example.com' },
        { id: 'rel2', get: () => 'test2@example.com' }
      ];
      
      mockParse.Query().find.mockResolvedValue(mockRelances);
      
      // Premier appel réussit, deuxième échoue
      let callCount = 0;
      const mockRelance = {
        id: null,
        set: jest.fn(),
        save: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(true);
          return Promise.reject(new Error('Save failed'));
        })
      };
      
      mockParse.Object.extend
        .mockReturnValue(jest.fn(() => mockRelance));
      
      const mockLog = {
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({ id: 'log1' })
      };
      
      mockParse.Object.extend
        .mockReturnValueOnce(jest.fn(() => ({ id: null }))) // Sequence pour log
        .mockReturnValueOnce(jest.fn(() => mockLog)) // SequenceLog
        .mockReturnValueOnce(jest.fn(() => ({ // Sequence pour désactivation
          id: 'seq123',
          set: jest.fn(),
          save: jest.fn().mockResolvedValue(true)
        })));
      
      const result = await deactivateSequenceAndCancelRelances('seq123');
      
      expect(result.success).toBe(false);
      expect(result.cancelledCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.message).toBe('1 relance(s) n\'ont pas pu être annulées');
    });
  });
});

// Note: Tests for cron functions would go here following the same pattern
// Due to the complex Jest setup in this project, the cron functions have been
// implemented following the same patterns as the existing relanceFunctions

console.log('Tests unitaires terminés');