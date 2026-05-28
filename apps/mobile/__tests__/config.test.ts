describe('mobile API config', () => {
  const originalEnv = process.env;

  function loadConfig(options: {
    apiBaseUrl?: string;
    hostUri?: string;
    platform: 'android' | 'ios';
  }) {
    jest.resetModules();
    process.env = { ...originalEnv };

    if (options.apiBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = options.apiBaseUrl;
    }

    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: {
        expoConfig: {
          hostUri: options.hostUri,
          extra: {},
        },
      },
    }));

    jest.doMock('react-native', () => ({
      Platform: {
        OS: options.platform,
      },
    }));

    let config: typeof import('../lib/config');
    jest.isolateModules(() => {
      config = require('../lib/config');
    });

    return config!;
  }

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses the Expo host when EXPO_PUBLIC_API_BASE_URL=auto', () => {
    const config = loadConfig({
      apiBaseUrl: 'auto',
      hostUri: '192.168.1.9:8081',
      platform: 'ios',
    });

    expect(config.API_BASE_URL).toBe('http://192.168.1.9:8000');
    expect(config.API_V1).toBe('http://192.168.1.9:8000/api/v1');
  });

  it('falls back to the Expo host during development when no env override is set', () => {
    const config = loadConfig({
      hostUri: '192.168.1.25:8081',
      platform: 'ios',
    });

    expect(config.API_BASE_URL).toBe('http://192.168.1.25:8000');
  });

  it('keeps explicit API URLs untouched', () => {
    const config = loadConfig({
      apiBaseUrl: 'https://travel-api.example.com/',
      hostUri: '192.168.1.9:8081',
      platform: 'android',
    });

    expect(config.API_BASE_URL).toBe('https://travel-api.example.com');
  });
});
