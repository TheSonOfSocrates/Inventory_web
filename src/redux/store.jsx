import { configureStore } from '@reduxjs/toolkit';
import { loadingStatusSlice, entitiesSlice, utilitiesSlice, settingsSlice, activeIdSlice } from './slice';
import itemInventoryReducer from './itemInventorySlice';
import dailyInventoryReducer from './dailyInventorySlice';
import itemBOMReducer from './itemBOMSlice';

export default configureStore({
  reducer: {
    activeId: activeIdSlice.reducer,
    loadingStatus: loadingStatusSlice.reducer,
    entities: entitiesSlice.reducer,
    settings: settingsSlice.reducer,
    utilities: utilitiesSlice.reducer,
    itemInventory: itemInventoryReducer,
    dailyInventory: dailyInventoryReducer,
    itemBOM: itemBOMReducer,
  },
});

