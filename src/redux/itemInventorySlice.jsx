import { createSlice } from "@reduxjs/toolkit";

const itemInventoryInitialState = {
  itemInventoryList: [],
};

const itemInventorySlice = createSlice({
    name: 'itemInventory',
    initialState: itemInventoryInitialState,
    reducers: {
      itemInventoryListReceived(state, action) {
        state.itemInventoryList = action.payload;
      }
    },
  });


  export const { itemInventoryListReceived } = itemInventorySlice.actions;
  export default itemInventorySlice.reducer;