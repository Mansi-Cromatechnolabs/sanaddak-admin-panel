// loanDataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loanDetails: null,
};

const loanDataSlice = createSlice({
  name: 'loanData',
  initialState,
  reducers: {
    setLoanData(state, action) {
      state.loanDetails = action.payload;
    },
    clearLoanData(state) {
      state.loanDetails = null;
    },
  },
});

export const { setLoanData, clearLoanData } = loanDataSlice.actions;
export default loanDataSlice.reducer;
