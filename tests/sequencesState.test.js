/**
 * Test Jest pour vérifier que le state est initialisé correctement
 */

describe('sequencesState initialization', () => {
  // Mock Alpine.data
  const mockAlpineData = jest.fn();
  global.Alpine = { data: mockAlpineData };

  // Mock document and addEventListener
  const mockAddEventListener = jest.fn();
  global.document = {
    addEventListener: mockAddEventListener
  };

  // Import the module after setting up mocks
  require('../front/public/js/pages/sequencesState.js');

  test('should initialize Alpine.data with sequencesState', () => {
    expect(mockAlpineData).toHaveBeenCalledWith('sequencesState', expect.any(Function));
  });

  test('sequencesState should have correct initial state', () => {
    const stateFactory = mockAlpineData.mock.calls[0][1];
    const state = stateFactory();

    expect(state).toEqual({
      sequences: [],
      isLoading: true,
      error: null,
      init: expect.any(Function),
      fetchSequences: expect.any(Function)
    });
  });

  test('init method should call fetchSequences', () => {
    const stateFactory = mockAlpineData.mock.calls[0][1];
    const state = stateFactory();
    
    // Mock fetchSequences
    state.fetchSequences = jest.fn();
    
    state.init();
    
    expect(state.fetchSequences).toHaveBeenCalled();
  });
});