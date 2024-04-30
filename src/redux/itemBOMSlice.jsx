import { createSlice } from "@reduxjs/toolkit";

const itemBOMInitialState = {
  itemBOMList: [],
};

const itemBOMSlice = createSlice({
    name: 'itemBOM',
    initialState: itemBOMInitialState,
    reducers: {
      itemBOMListReceived(state, action) {
        state.itemBOMList = action.payload;
      },
      itemBOMUpdated(state, action) {
        const ind = state.itemBOMList.findIndex((iv) => iv.id === action.payload.id);
        if (ind !== -1) {
          state.itemBOMList[ind] = {...state.itemBOMList[ind], ...action.payload}
        }
      }
    },
  });


  export const { itemBOMListReceived, itemBOMUpdated } = itemBOMSlice.actions;
  export default itemBOMSlice.reducer;