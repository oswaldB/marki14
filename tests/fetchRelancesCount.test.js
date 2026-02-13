/**
 * Test Jest pour vérifier que fetchRelancesCount retourne un nombre valide
 */

describe('fetchRelancesCount function', () => {
  // Mock global fetch
  global.fetch = jest.fn();

  // Import the module after setting up mocks
  const { fetchRelancesCount } = require('../front/public/js/pages/sequences-module1.js');

  beforeEach(() => {
    fetch.mockClear();
  });

  test('should return a promise', () => {
    const result = fetchRelancesCount('test-sequence-id');
    expect(result).toBeInstanceOf(Promise);
  });

  test('should return a valid number on success', async () => {
    // Mock successful response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: 5 })
      })
    );

    const result = await fetchRelancesCount('test-sequence-id');
    expect(result).toBe(5);
  });

  test('should return 0 on error', async () => {
    // Mock failed response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    const result = await fetchRelancesCount('test-sequence-id');
    expect(result).toBe(0);
  });

  test('should call fetch with correct URL and body', async () => {
    // Mock successful response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: 3 })
      })
    );

    await fetchRelancesCount('test-sequence-id');
    
    // Verify fetch was called with correct arguments
    expect(fetch).toHaveBeenCalledWith(
      'https://dev.markidiags.com/parse/classes/Impayes',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'X-Parse-Application-Id': 'markidiagsAppId',
          'X-Parse-Javascript-Key': 'markidiagsJavaScriptKey',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          where: {
            sequence: {
              __type: 'Pointer',
              className: 'Sequences',
              objectId: 'test-sequence-id'
            }
          },
          count: 1
        })
      })
    );
  });
});