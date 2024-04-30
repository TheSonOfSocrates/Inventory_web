import { createSlice } from "@reduxjs/toolkit";

const loadingInitialState = {
  isLoading: Boolean,
};

const activeIdInitialState = {
  activeId: '',
};

const entitiesInitialState = {
  persons: [],
  companies: [],
  embeddedDevices: [],
  vehicles: [],
  itemSKUs: [],
};

const utilitiesInitialState = {
  directLabelPrinting: {},
  genericConfig: {},
};

const settingsInitialState = {
  //General Settings
  status: [],
  accessCodes: [],
  companyTypes: [],
  currencies: [],
  transferTypes: [],
  handlingUnits: [],
  itemCategories: [],
  itemSubCategories: [],
  itemSubTypes: [],
  itemTypes: [],
  reports: [],
  reasons: [],
  reasonsTypes: [],
  UOMs: [],
  rolesAndPermissions: [],
  costCenters: [],
  //Location Settings
  areas: [],
  areaTypes: [],
  bays: [],
  bayTypes: [],
  bins: [],
  binTypes: [],
  branches: [],
  branchTypes: [],
  countries: [],
  countryTypes: [],
  levels: [],
  levelTypes: [],
  positions: [],
  positionTypes: [],
  regions: [],
  regionTypes: [],
  rooms: [],
  roomTypes: [],
  rows: [],
  rowTypes: [],
  warehouses: [],
  warehouseTypes: [],
  zones: [],
  zoneTypes: [],
};

export const loadingStatusSlice = createSlice({
  name: "loadingStatus",
  initialState: loadingInitialState,
  reducers: {
    updateLoadingStatus: (state, action) => {
      if (action.payload) state.isLoading = true;
      else state.isLoading = false;
    },
  },
});

export const activeIdSlice = createSlice({
  name: "activeId",
  initialState: activeIdInitialState,
  reducers: {
    getActiveId: (state, action) => {
      state.activeId = action.payload;
    },
  },
});

export const entitiesSlice = createSlice({
  name: "entities",
  initialState: entitiesInitialState,
  reducers: {
    getPersons: (state, action) => {
      state.persons = action.payload;
    },
    addPerson: (state, action) => {
      state.persons = [action.payload, ...state.persons]
    },
    updatePersons: (state, action) => {
      console.log("====> state companies", state.companies. action.payload)
      const index = state.persons.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.persons[index] = action.payload;
      }
    },

    getCompanies: (state, action) => {
      state.companies = action.payload;
    },
    addCompany: (state, action) => {
      state.companies = [action.payload, ...state.companies]
    },
    updateCompanies: (state, action) => {
      const index = state.companies.findIndex(
        (item) => item.id === action.payload.id
      );
      console.log('index ===> ', index, action.payload)
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
    },

    getEmbeddedDevices: (state, action) => {
      state.embeddedDevices = action.payload;
    },
    addEmbeddedDevice: (state, action) => {
      state.embeddedDevices = [action.payload, ...state.embeddedDevices]
    },
    updateEmbeddedDevice: (state, action) => {
      const index = state.embeddedDevices.findIndex(
        (item) => item.id === action.payload.id
      );
      console.log('index ===> ', index, action.payload)
      if (index !== -1) {
        state.embeddedDevices[index] = action.payload;
      }
    },
    getVehicles: (state, action) => {
      state.vehicles = action.payload;
    },
    getItemSKUs: (state, action) => {
      state.itemSKUs = action.payload;
    },
    addItemSKU: (state, action) => {
      state.itemSKUs = [action.payload, ...state.itemSKUs]
    },
    updateItemSKUs: (state, action) => {
      const index = state.itemSKUs.findIndex(
        (item) => item.id === action.payload.id
      );
      console.log('index ===> ', index, action.payload)
      if (index !== -1) {
        state.itemSKUs[index] = action.payload;
      }
    }
  },
});

export const settingsSlice = createSlice({
  name: "settings",
  initialState: settingsInitialState,
  reducers: {
    //General Settings
    getReasons: (state, action) => {
      state.reasons = action.payload
    },
    getReasonsTypes: (state, action) => {
      state.reasonsTypes = action.payload
    },
    getStatus: (state, action) => {
      state.status = action.payload;
    },
    getAccessCodes: (state, action) => {
      state.accessCodes = action.payload;
    },
    getCompanyTypes: (state, action) => {
      state.companyTypes = action.payload;
    },
    getCurrencies: (state, action) => {
      state.currencies = action.payload;
    },
    getTransferTypes: (state, action) => {
      state.transferTypes = action.payload;
    },
    getHandlingUnits: (state, action) => {
      state.handlingUnits = action.payload;
    },
    getItemCategories: (state, action) => {
      state.itemCategories = action.payload;
    },
    getItemSubCategories: (state, action) => {
      state.itemSubCategories = action.payload;
    },
    getItemTypes: (state, action) => {
      state.itemTypes = action.payload;
    },
    getItemSubTypes: (state, action) => {
      state.itemSubTypes = action.payload;
    },
    getReports: (state, action) => {
      state.reports = action.payload;
    },
    getUOMs: (state, action) => {
      state.UOMs = action.payload;
    },
    getRolesAndPermissions: (state, action) => {
      state.rolesAndPermissions = action.payload;
    },
    addRolesAndPermissions: (state, action) => {
      state.rolesAndPermissions = [action.payload, ...state.rolesAndPermissions]
    },
    updateRolesAndPermissions: (state, action) => {
      const index = state.rolesAndPermissions.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.rolesAndPermissions[index] = action.payload;
      }
    },
    getCostCenters: (state, action) => {
      state.costCenters = action.payload;
    },

    //Location Settings
    getAreas: (state, action) => {
      state.areas = action.payload;
    },
    getAreaTypes: (state, action) => {
      state.areaTypes = action.payload;
    },
    getBays: (state, action) => {
      state.bays = action.payload;
    },
    getBayTypes: (state, action) => {
      state.bayTypes = action.payload;
    },
    getBins: (state, action) => {
      state.bins = action.payload;
    },
    getBinTypes: (state, action) => {
      state.binTypes = action.payload;
    },
    getBranches: (state, action) => {
      state.branches = action.payload;
    },
    getBranchTypes: (state, action) => {
      state.branchTypes = action.payload;
    },
    getCountries: (state, action) => {
      state.countries = action.payload;
    },
    getCountryTypes: (state, action) => {
      state.countryTypes = action.payload;
    },
    getLevels: (state, action) => {
      state.levels = action.payload;
    },
    getLevelTypes: (state, action) => {
      state.levelTypes = action.payload;
    },
    getPositions: (state, action) => {
      state.positions = action.payload;
    },
    getPositionTypes: (state, action) => {
      state.positionTypes = action.payload;
    },
    getRegions: (state, action) => {
      state.regions = action.payload;
    },
    getRegionTypes: (state, action) => {
      state.regionTypes = action.payload;
    },
    getRooms: (state, action) => {
      state.rooms = action.payload;
    },
    getRoomTypes: (state, action) => {
      state.roomTypes = action.payload;
    },
    getRows: (state, action) => {
      state.rows = action.payload;
    },
    getRowTypes: (state, action) => {
      state.rowTypes = action.payload;
    },
    getWarehouses: (state, action) => {
      state.warehouses = action.payload;
    },
    getWarehouseTypes: (state, action) => {
      state.warehouseTypes = action.payload;
    },
    getZones: (state, action) => {
      state.zones = action.payload;
    },
    getZoneTypes: (state, action) => {
      state.zoneTypes = action.payload;
    },
  },
});

export const utilitiesSlice = createSlice({
  name: "utilities",
  initialState: utilitiesInitialState,
  reducers: {
    getDirectLabelPrinting: (state, action) => {
      state.directLabelPrinting = action.payload;
    },
    updateDirectLabelPrinting: (state, action) => {
      state.directLabelPrinting = action.payload;
    },

    getGenericConfig: (state, action) => {
      state.genericConfig = action.payload;
    },
    updateGenericConfig: (state, action) => {
      state.genericConfig = action.payload;
    },
  },
});

export const { getActiveId } = activeIdSlice.actions;
export const { updateLoadingStatus } = loadingStatusSlice.actions;
export const {
  addPerson,
  updatePersons,
  getPersons,
  addCompany,
  getCompanies,
  updateCompanies,
  getEmbeddedDevices,
  addEmbeddedDevice,
  updateEmbeddedDevice,
  getVehicles,
  getItemSKUs,
  addItemSKU,
  updateItemSKUs
} = entitiesSlice.actions;
export const {
  updateDirectLabelPrinting,
  getDirectLabelPrinting,
  getGenericConfig,
  updateGenericConfig,
} = utilitiesSlice.actions;
export const {
  //General Settings
  getReasons,
  getReasonsTypes,
  getStatus,
  getAccessCodes,
  getCompanyTypes,
  getCurrencies,
  getTransferTypes,
  getHandlingUnits,
  getItemCategories,
  getItemSubCategories,
  getItemSubTypes,
  getItemTypes,
  getReports,
  getUOMs,
  getRolesAndPermissions,
  addRolesAndPermissions,
  updateRolesAndPermissions,
  getCostCenters,
  //Location Settings
  getAreaTypes,
  getAreas,
  getBayTypes,
  getBays,
  getBinTypes,
  getBins,
  getBranches,
  getBranchTypes,
  getCountries,
  getCountryTypes,
  getLevels,
  getLevelTypes,
  getPositionTypes,
  getPositions,
  getRegionTypes,
  getRegions,
  getRoomTypes,
  getRooms,
  getRowTypes,
  getRows,
  getWarehouseTypes,
  getWarehouses,
  getZoneTypes,
  getZones,
} = settingsSlice.actions;
