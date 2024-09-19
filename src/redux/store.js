/* eslint-disable arrow-body-style */
// import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import authReducer from './authSlice';
import dataReducer from './dataSlice';
import loanDataReducer from './loanDataSlice';
import agreementReducer from './agreementSlice';
import appointmentReducer from './appointmentTypeSlice';

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// Persist config for auth reducer
const authPersistConfig = {
  key: 'auth',
  storage,
};

// Persist config for agreement reducer
const agreementPersistConfig = {
  key: 'agreementData',
  storage,
};

const persistedReducer = persistReducer(authPersistConfig, authReducer);
const persistedAgreementReducer = persistReducer(agreementPersistConfig, agreementReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
    loanData: loanDataReducer,
    getData: dataReducer,
    agreementData: persistedAgreementReducer,
    appointment: appointmentReducer,
  },
  // Middleware for non-serializable values (if needed)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
