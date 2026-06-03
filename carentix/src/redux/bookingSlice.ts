import { createSlice } from '@reduxjs/toolkit'
// Define a type for the slice state
interface IbookingState {
  sucess: boolean;
}

// Define the initial state using that type
const initialState: IbookingState = {
  sucess: false
}

export const bookingSlice = createSlice({
  name: 'booking',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setBookingSuccess: (state, action) => {
      state.sucess = action.payload;
    }
  },
})

export const { setBookingSuccess } = bookingSlice.actions

export default bookingSlice.reducer