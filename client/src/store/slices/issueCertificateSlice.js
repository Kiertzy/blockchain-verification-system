import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'https://blockchain-based-academic-certificate.onrender.com/api/v1';

// ✅ Async thunk for issuing a certificate
export const issueCertificate = createAsyncThunk(
  "certificate/issueCertificate",
  async (certificateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Certificate/IssueCertificate`, // must match your backend route
        certificateData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to issue certificate"
      );
    }
  }
);

const issueCertificateSlice = createSlice({
  name: "issueCertificate",
  initialState: {
    issuedCertificate: null, // Full certificate details after issuance
    blockchainData: null, // txHash and certHash from blockchain
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearIssueCertificateState: (state) => {
      state.issuedCertificate = null;
      state.blockchainData = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(issueCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.issuedCertificate = null;
        state.blockchainData = null;
      })
      .addCase(issueCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Certificate issued successfully";
        state.issuedCertificate = action.payload.certificate || null;
        state.blockchainData = action.payload.blockchain || null;
      })
      .addCase(issueCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearIssueCertificateState } = issueCertificateSlice.actions;

export default issueCertificateSlice.reducer;

