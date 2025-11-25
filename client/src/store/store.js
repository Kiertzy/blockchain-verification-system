// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import collegeReducer from './slices/collegeSlice';
import courseReducer from './slices/courseSlice';
import majorReducer from './slices/majorSlice';
import registrationReducer from './slices/registrationSlice';
import authRecoveryReducer from './slices/authRecoverySlice';
import userReducer from './slices/userSlice';
import updateUserAccountStatusReducer from './slices/updateUserAccountStatusSlice';
import CertificateReducer from './slices/certificateSlice';
import IssueCertificateReducer from './slices/issueCertificateSlice';
import CertViewReducer from './slices/certViewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    college: collegeReducer,
    course: courseReducer,
    major: majorReducer,
    registration: registrationReducer,
    authRecovery: authRecoveryReducer,
    users: userReducer,
    updateUserAccountStatus: updateUserAccountStatusReducer,
    certificate: CertificateReducer,
    issueCertificate: IssueCertificateReducer,
    allCertificates: CertViewReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;

// Hydrate auth state from localStorage immediately
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

if (token && user) {
  store.dispatch({
    type: 'auth/verifyOTP/fulfilled',
    payload: {
      token,
      user: JSON.parse(user),
    },
  });
}