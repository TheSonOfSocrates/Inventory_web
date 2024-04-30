import { createSlice } from "@reduxjs/toolkit";

const dailyInventoryInitialState = {
  dailyInventoryList: [],
};

const dailyInventorySlice = createSlice({
    name: 'dailyInventory',
    initialState: dailyInventoryInitialState,
    reducers: {
      dailyInventoryListReceived(state, action) {
        state.dailyInventoryList = action.payload;
      },
      dailyInventoryUpdated(state, action) {
        const ind = state.dailyInventoryList.findIndex((iv) => iv.id === action.payload.id);
        if (ind !== -1) {
          state.dailyInventoryList[ind] = {...state.dailyInventoryList[ind], ...action.payload}
        }
      }
    },
  });


  export const { dailyInventoryListReceived, dailyInventoryUpdated } = dailyInventorySlice.actions;
  export default dailyInventorySlice.reducer;