describe('API Axios Instance', () => {
    const setup = () => {
      // Make sure each test gets a fresh module evaluation of index.ts
      jest.resetModules();
  
      const mockInterceptorUse = jest.fn();
      const mockAxiosInstance = {
        interceptors: {
          request: {
            use: mockInterceptorUse,
          },
        },
      };
  
      const create = jest.fn(() => mockAxiosInstance);
  
      jest.doMock('axios', () => ({
        __esModule: true,
        default: { create },
        create,
      }));
  
      const api = require('./index').default as typeof import('./index').default;
      const interceptorFn = mockInterceptorUse.mock.calls[0]?.[0];
      return { api, create, interceptorFn };
    };
  
    beforeEach(() => {
      localStorage.clear();
    });
  
    test('should have correct baseURL', () => {
      const { create } = setup();
  
      expect(create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/',
      });
    });
  
    test('should attach Authorization header when token exists', () => {
      const { interceptorFn } = setup();
  
      expect(interceptorFn).toBeDefined();
  
      localStorage.setItem('token', 'test-token');
  
      const config: any = { headers: {} };
      const updatedConfig = interceptorFn(config);
  
      expect(updatedConfig.headers.Authorization).toBe('Bearer test-token');
    });
  
    test('should not attach Authorization header when no token exists', () => {
      const { interceptorFn } = setup();
  
      expect(interceptorFn).toBeDefined();
  
      const config: any = { headers: {} };
      const updatedConfig = interceptorFn(config);
  
      expect(updatedConfig.headers.Authorization).toBeUndefined();
    });
  
    test('should return config object from interceptor', () => {
      const { interceptorFn } = setup();
  
      expect(interceptorFn).toBeDefined();
  
      const config: any = { headers: {} };
      const result = interceptorFn(config);
  
      expect(result).toBe(config);
    });
  });