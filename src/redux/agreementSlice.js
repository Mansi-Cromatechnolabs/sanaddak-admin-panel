// loanDataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  agreement: null,
};

const agreementSlice = createSlice({
  name: 'agreementData',
  initialState,
  reducers: {
    setAgreementData(state, action) {
      state.agreement = action.payload;
    },
    clearAgreementData(state) {
      state.agreement = null;
    },
  },
});

export const { setAgreementData, clearAgreementData } = agreementSlice.actions;
export default agreementSlice.reducer;
