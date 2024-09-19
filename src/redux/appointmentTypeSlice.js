// appointmentTypeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointment: null,
};

const appointmentTypeSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointmentType(state, action) {
      state.appointment = action.payload;
    },
    clearAppointmentType(state) {
      state.appointment = null;
    },
  },
});

export const { setAppointmentType, clearAppointmentType } = appointmentTypeSlice.actions;
export default appointmentTypeSlice.reducer;
