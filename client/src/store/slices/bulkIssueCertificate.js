import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://blockchain-based-academic-certificate.onrender.com/api/v1";

// ✅ Async thunk for bulk issuing certificates
export const bulkIssueCertificate = createAsyncThunk(
  "certificate/bulkIssueCertificate",
  async (bulkData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Certificate/BulkIssueCertificate`,
        bulkData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to bulk issue certificates"
      );
    }
  }
);

const bulkIssueCertificateSlice = createSlice({
  name: "bulkIssueCertificate",
  initialState: {
    results: null, // array of results per student
    blockchainData: null, // for storing optional tx info
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearBulkIssueCertificateState: (state) => {
      state.results = null;
      state.blockchainData = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bulkIssueCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.results = null;
        state.blockchainData = null;
      })
      .addCase(bulkIssueCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.message =
          action.payload.message || "Bulk certificates issued successfully";

        // Backend returns:
        // { message, results: [...], blockchain: {...} }
        state.results = action.payload.results || null;
        state.blockchainData = action.payload.blockchain || null;
      })
      .addCase(bulkIssueCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBulkIssueCertificateState } = bulkIssueCertificateSlice.actions;

export default bulkIssueCertificateSlice.reducer;

