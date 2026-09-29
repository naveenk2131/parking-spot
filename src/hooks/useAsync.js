import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utilities/helpers';

/**
 * Custom hook for async operations with loading, error, and data state
 */
const useAsync = (asyncFn) => {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (...args) => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const result = await asyncFn(...args);
      setState({ data: result, error: null, isLoading: false });
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, execute, reset };
};

export default useAsync;
