import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

// Initial state
const initialState = {
  user: authService.getSavedUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: true,
  error: null,
};

// Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext(null);

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!authService.isAuthenticated()) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }
      try {
        const result = await authService.getMe();
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: result.data.user, token: authService.getToken() },
        });
      } catch (error) {
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };
    validateToken();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    try {
      const result = await authService.login(email, password);
      authService.saveAuth(result.data.token, result.data.user);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
      return result.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    try {
      const result = await authService.register(data);
      authService.saveAuth(result.data.token, result.data.user);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
      return result.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    const updated = { ...state.user, ...userData };
    localStorage.setItem('ps_user', JSON.stringify(updated));
  }, [state.user]);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
