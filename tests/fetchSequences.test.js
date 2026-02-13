/**
 * Test Jest pour vérifier que fetchSequences retourne une promesse résolue avec les données attendues
 */

describe('fetchSequences function', () => {
  // Mock global fetch
  global.fetch = jest.fn();

  // Import the module after setting up mocks
  const { fetchSequences } = require('../front/public/js/pages/sequences-module1.js');

  beforeEach(() => {
    fetch.mockClear();
  });

  test('should return a promise', () => {
    const result = fetchSequences();
    expect(result).toBeInstanceOf(Promise);
  });

  test('should call fetch with correct URL and headers', async () => {
    // Mock successful response
    const mockSequences = [
      {
        objectId: 'seq1',
        nom: 'Séquence 1',
        isActif: true,
        isAuto: true
      }
    ];
    
    const mockRelances = 5;
    
    // Mock fetch for sequences
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: mockSequences })
      })
    );
    
    // Mock fetch for relances
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: mockRelances })
      })
    );

    const result = await fetchSequences();
    
    // Verify fetch was called with correct arguments
    expect(fetch).toHaveBeenCalledWith(
      'https://dev.markidiags.com/parse/classes/Sequences',
      expect.objectContaining({
        headers: {
          'X-Parse-Application-Id': 'markidiagsAppId',
          'X-Parse-Javascript-Key': 'markidiagsJavaScriptKey',
          'Content-Type': 'application/json'
        }
      })
    );
    
    // Verify the result structure
    expect(result).toEqual([
      {
        id: 'seq1',
        nom: 'Séquence 1',
        statut: true,
        typePeuplement: 'automatique',
        relancesCount: mockRelances
      }
    ]);
  });

  test('should handle errors correctly', async () => {
    // Mock failed response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    await expect(fetchSequences()).rejects.toThrow(
      'Erreur lors de la récupération des séquences: 500'
    );
  });
});