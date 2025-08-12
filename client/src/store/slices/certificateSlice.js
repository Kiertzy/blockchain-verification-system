import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

// Async thunk for verifying certificate by certHash
export const verifyCertificate = createAsyncThunk(
  "certificate/verifyCertificate",
  async (certHash, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Certificate/VerifyCertificate`, // Change to your actual endpoint
        { certHash }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify certificate"
      );
    }
  }
);

export const verifyBulkCertificates = createAsyncThunk(
  "certificate/verifyBulkCertificates",
  async (certHashes, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Certificate/BulkVerificationCertificate`, // Must match your backend route
        { certHashes }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify bulk certificates"
      );
    }
  }
);

const verifyCertificateSlice = createSlice({
  name: "certificate",
  initialState: {
    certificateData: null,
    blockchainData: null,
    issuedTo: null,
    issuedBy: null,
    bulkResults: [],
    loading: false,
    bulkLoading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearVerifyCertificateState: (state) => {
      state.certificateData = null;
      state.blockchainData = null;
      state.issuedTo = null;
      state.issuedBy = null;
      state.bulkResults = [];
      state.loading = false;
      state.bulkLoading = false;
      state.error = null;
      state.bulkError = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.certificateData = null;
        state.blockchainData = null;
        state.issuedTo = null;
        state.issuedBy = null;
      })
      .addCase(verifyCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || null;
        state.certificateData = action.payload.certificate || null;
        state.blockchainData = action.payload.blockchain || null;
        state.issuedTo = action.payload.issuedTo || null;
        state.issuedBy = action.payload.issuedBy || null;
      })
      .addCase(verifyCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyBulkCertificates.pending, (state) => {
        state.bulkLoading = true;
        state.bulkError = null;
        state.bulkResults = [];
      })
      .addCase(verifyBulkCertificates.fulfilled, (state, action) => {
        state.bulkLoading = false;
        state.bulkResults = action.payload.results || [];
      })
      .addCase(verifyBulkCertificates.rejected, (state, action) => {
        state.bulkLoading = false;
        state.bulkError = action.payload;
      });
  },
});

export const { clearVerifyCertificateState } = verifyCertificateSlice.actions;

export default verifyCertificateSlice.reducer;
