import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { CRUD, op_status } from "../utils/js_functions";
import { logout } from "../utils/js_functions";
import { useAuth } from "../utils/js_hooks";
import {
  //Entities
  EntityPersonUrl,
  EntityCompanyUrl,
  EntityEmbeddedDeviceUrl,
  EntityVehicleUrl,
  EntityItemSKUUrl,
  DirectLabelPrintingUrl,
  //Settings-General
  SettingsReasonsUrl,
  SettingsReasonsTypeUrl,
  SettingsStatusUrl,
  SettingsAccessCodeUrl,
  SettingsCompanyTypeUrl,
  SettingsCurrencyUrl,
  SettingsHandlingUnitUrl,
  SettingsItemCategoryUrl,
  SettingsItemSubCategoryUrl,
  SettingsItemSubTypeUrl,
  SettingsItemTypeUrl,
  SettingsReportsUrl,
  SettingsUOMUrl,
  SettingsRolesAndPermissionsUrl,
  //Settings-Location
  SettingsLocationCountryUrl,
  SettingsLocationCountryTypeUrl,
  SettingsLocationRegionUrl,
  SettingsLocationRegionTypeUrl,
  SettingsLocationBranchUrl,
  SettingsLocationBranchTypeUrl,
  SettingsLocationWarehouseUrl,
  SettingsLocationWarehouseTypeUrl,
  SettingsLocationZoneUrl,
  SettingsLocationZoneTypeUrl,
  SettingsLocationAreaUrl,
  SettingsLocationAreaTypeUrl,
  SettingsLocationRoomUrl,
  SettingsLocationRoomTypeUrl,
  SettingsLocationRowUrl,
  SettingsLocationRowTypeUrl,
  SettingsLocationBayUrl,
  SettingsLocationBayTypeUrl,
  SettingsLocationLevelUrl,
  SettingsLocationLevelTypeUrl,
  SettingsLocationPositionUrl,
  SettingsLocationPositionTypeUrl,
  SettingsLocationBinUrl,
  SettingsLocationBinTypeUrl,
  CurrentItemInventoryUrl,
  SettingsCostCenterUrl,
  SettingsGenericConfigUrl,
  SettingsTransferTypeUrl,
} from "../utils/network";
import {
  //Status
  updateLoadingStatus,
  //Entities
  getPersons,
  getCompanies,
  getEmbeddedDevices,
  getVehicles,
  getItemSKUs,
  //Utilities
  getDirectLabelPrinting,
  //Settings-General
  getCompanyTypes,
  getCurrencies,
  getHandlingUnits,
  getItemCategories,
  getItemSubCategories,
  getItemSubTypes,
  getItemTypes,
  getReports,
  getReasonsTypes,
  getReasons,
  getUOMs,
  getRolesAndPermissions,
  getCostCenters,
  //Settings-Location
  getAreaTypes,
  getAreas,
  getBayTypes,
  getBays,
  getBinTypes,
  getBins,
  getBranchTypes,
  getBranches,
  getCountries,
  getCountryTypes,
  getLevelTypes,
  getLevels,
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
  getStatus,
  getAccessCodes,
  getGenericConfig,
  getTransferTypes,
} from "../redux/slice";

import {
  itemInventoryListReceived  
} from "../redux/itemInventorySlice"

import Layout from "./Layout";

const AuthRoute = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));

  // const isMounted = useRef(true);
  const getItem = useCallback(async () => {
    // setLoading(true);
    dispatch(updateLoadingStatus(true));

    /********CRUD OPERATION *********/
    //Entities
    const resPersons = await CRUD("get", EntityPersonUrl, null, null);
    const sortedPersons = await resPersons.sort((a, b) => {
      const nameA = a.user_name || "";
      const nameB = b.user_name || "";
      return nameA.localeCompare(nameB);
    });
    const resCompanies = await CRUD("get", EntityCompanyUrl, null, null);
    const sortedCompanies = await resCompanies.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const resEmbeddedDevices = await CRUD(
      "get",
      EntityEmbeddedDeviceUrl,
      null,
      null
    );
    const sortedEmbeddedDevices = await resEmbeddedDevices.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resVehicles = await CRUD("get", EntityVehicleUrl, null, null);
    const sortedVehicles = await resVehicles.sort((a, b) => {
      const nameA = a.code || "";
      const nameB = b.code || "";
      return nameA.localeCompare(nameB);
    });

    let resItemSKUs = await CRUD("get", EntityItemSKUUrl, null, null);
    const sortedItemSKUs = await resItemSKUs.sort((a, b) => {
      const nameA = a.code || "";
      const nameB = b.code || "";
      return nameA.localeCompare(nameB);
    });

    let resCostCenters = await CRUD("get", SettingsCostCenterUrl, null, null)

    const sortedCostCenters = await resCostCenters.sort((a, b) =>
      new Date(b.updated_datetime) - new Date(a.updated_datetime))

    //Utilities
    const resDirectLabelPrinting = await CRUD(
      "get",
      DirectLabelPrintingUrl,
      null,
      null
    );
    const sortedDirectLabelPrinting = await resDirectLabelPrinting.sort(
      (a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      }
    );

    const resGenericConfig = await CRUD(
      "get",
      SettingsGenericConfigUrl,
      null,
      null
    );

    const sortedGenericConfig = await resGenericConfig.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    //Settings-General
    const resStatus = await op_status("get", SettingsStatusUrl, null, null);
    const sortedStatus = await resStatus.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    
    const activeStatusId = sortedStatus.find((it) => it.name === 'active')?.id ?? '';
    const inactiveStatusId = sortedStatus.find((it) => it.name === 'inactive')?.id ?? '';

    const resItemInventory = await CRUD("get", CurrentItemInventoryUrl, null, null);
    const sortedItemInventory = resItemInventory.sort((a, b) => {
      const nameA = a.code || "";
      const nameB = b.code || "";
      return nameA.localeCompare(nameB);
    });
    

    const resAccessCodes = await op_status("get", SettingsAccessCodeUrl, null, null);
    const sortedAccessCodes = await resAccessCodes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const resReasonsTypes = await CRUD(
      "get",
      SettingsReasonsTypeUrl,
      null,
      null
    );
    const sortedReasonsTypes = await resReasonsTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const resReasons = await CRUD("get", SettingsReasonsUrl, null, null);
    const sortedReasons = await resReasons.sort((a, b) => {
      const nameA = a.reasons || "";
      const nameB = b.reasons || "";
      return nameA.localeCompare(nameB);
    });

    const resComanytypes = await CRUD(
      "get",
      SettingsCompanyTypeUrl,
      null,
      null
    );
    const sortedComanytypes = await resComanytypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resCurrencies = await CRUD("get", SettingsCurrencyUrl, null, null);
    const sortedCurrencies = await resCurrencies.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resTransferTypes = await CRUD("get", SettingsTransferTypeUrl, null, null);
    const sortedTransferTypes = await resTransferTypes.sort((a, b) =>
    new Date(b.updated_datetime) - new Date(a.updated_datetime))

    const resHandlingUnits = await CRUD(
      "get",
      SettingsHandlingUnitUrl,
      null,
      null
    );
    const sortedHandlingUnits = await resHandlingUnits.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resItemCategories = await CRUD(
      "get",
      SettingsItemCategoryUrl,
      null,
      null
    );
    const sortedItemCategories = await resItemCategories.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resItemSubCategories = await CRUD(
      "get",
      SettingsItemSubCategoryUrl,
      null,
      null
    );
    const sortedItemSubCategories = await resItemSubCategories.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resItemTypes = await CRUD("get", SettingsItemTypeUrl, null, null);
    const sortedItemTypes = await resItemTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resItemSubTypes = await CRUD(
      "get",
      SettingsItemSubTypeUrl,
      null,
      null
    );
    const sortedItemSubTypes = await resItemSubTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resUOMs = await CRUD("get", SettingsUOMUrl, null, null);
    const sortedUOMs = await resUOMs.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resReports = await CRUD("get", SettingsReportsUrl, null, null);
    const sortedReports = await resReports.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    const resRolesAndPermissions = await CRUD(
      "get",
      SettingsRolesAndPermissionsUrl,
      null,
      null
    );
    const sortedRolesAndPermissions = await resRolesAndPermissions.sort(
      (a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      }
    );

    //Settings-Location
    const Countries = await CRUD("get", SettingsLocationCountryUrl, null, null);
    const sortedCountries = await Countries.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const CountryTypes = await CRUD(
      "get",
      SettingsLocationCountryTypeUrl,
      null,
      null
    );
    const sortedCountryTypes = await CountryTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Regions = await CRUD("get", SettingsLocationRegionUrl, null, null);
    const sortedRegions = await Regions.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const RegionTypes = await CRUD(
      "get",
      SettingsLocationRegionTypeUrl,
      null,
      null
    );
    const sortedRegionTypes = await RegionTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Branches = await CRUD("get", SettingsLocationBranchUrl, null, null);
    const sortedBranches = await Branches.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const BranchTypes = await CRUD(
      "get",
      SettingsLocationBranchTypeUrl,
      null,
      null
    );
    const sortedBranchTypes = await BranchTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Warehouses = await CRUD(
      "get",
      SettingsLocationWarehouseUrl,
      null,
      null
    );
    const sortedWarehouses = await Warehouses.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const WarehouseTypes = await CRUD(
      "get",
      SettingsLocationWarehouseTypeUrl,
      null,
      null
    );
    const sortedWarehouseTypes = await WarehouseTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Zones = await CRUD("get", SettingsLocationZoneUrl, null, null);
    const sortedZones = await Zones.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const ZoneTypes = await CRUD(
      "get",
      SettingsLocationZoneTypeUrl,
      null,
      null
    );
    const sortedZoneTypes = await ZoneTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Areas = await CRUD("get", SettingsLocationAreaUrl, null, null);
    const sortedAreas = await Areas.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const AreaTypes = await CRUD(
      "get",
      SettingsLocationAreaTypeUrl,
      null,
      null
    );
    const sortedAreaTypes = await AreaTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Rooms = await CRUD("get", SettingsLocationRoomUrl, null, null);
    const sortedRooms = await Rooms.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const RoomTypes = await CRUD(
      "get",
      SettingsLocationRoomTypeUrl,
      null,
      null
    );
    const sortedRoomTypes = await RoomTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Rows = await CRUD("get", SettingsLocationRowUrl, null, null);
    const sortedRows = await Rows.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const RowTypes = await CRUD("get", SettingsLocationRowTypeUrl, null, null);
    const sortedRowTypes = await RowTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Bays = await CRUD("get", SettingsLocationBayUrl, null, null);
    const sortedBays = await Bays.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const BayTypes = await CRUD("get", SettingsLocationBayTypeUrl, null, null);
    const sortedBayTypes = await BayTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Levels = await CRUD("get", SettingsLocationLevelUrl, null, null);
    const sortedLevels = await Levels.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const LevelTypes = await CRUD(
      "get",
      SettingsLocationLevelTypeUrl,
      null,
      null
    );
    const sortedLevelTypes = await LevelTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Positions = await CRUD(
      "get",
      SettingsLocationPositionUrl,
      null,
      null
    );
    const sortedPositions = await Positions.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const PositionTypes = await CRUD(
      "get",
      SettingsLocationPositionTypeUrl,
      null,
      null
    );
    const sortedPositionTypes = await PositionTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const Bins = await CRUD("get", SettingsLocationBinUrl, null, null);
    const sortedBins = await Bins.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
    const BinTypes = await CRUD("get", SettingsLocationBinTypeUrl, null, null);
    const sortedBinTypes = await BinTypes.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    //Entities
    dispatch(getPersons(sortedPersons));
    dispatch(getCompanies(sortedCompanies));
    dispatch(getEmbeddedDevices(sortedEmbeddedDevices));
    dispatch(getVehicles(sortedVehicles));
    dispatch(getItemSKUs(sortedItemSKUs));

    //Utilities
    dispatch(getDirectLabelPrinting(sortedDirectLabelPrinting[0]));
    dispatch(getGenericConfig(sortedGenericConfig[0]));

    //Settings-General
    dispatch(getReasons(sortedReasons));
    dispatch(getReasonsTypes(sortedReasonsTypes));
    dispatch(getStatus(sortedStatus));
    dispatch(itemInventoryListReceived(sortedItemInventory));
    dispatch(getAccessCodes(sortedAccessCodes));
    dispatch(getCompanyTypes(sortedComanytypes));
    dispatch(getCurrencies(sortedCurrencies));
    dispatch(getTransferTypes(sortedTransferTypes));
    dispatch(getHandlingUnits(sortedHandlingUnits));
    dispatch(getItemCategories(sortedItemCategories));
    dispatch(getItemSubCategories(sortedItemSubCategories));
    dispatch(getItemTypes(sortedItemTypes));
    dispatch(getItemSubTypes(sortedItemSubTypes));
    dispatch(getReports(sortedReports));
    dispatch(getUOMs(sortedUOMs));
    dispatch(getRolesAndPermissions(sortedRolesAndPermissions));
    dispatch(getCostCenters(sortedCostCenters))

    //Settings-Location
    dispatch(getCountries(sortedCountries));
    dispatch(getCountryTypes(sortedCountryTypes));
    dispatch(getRegions(sortedRegions));
    dispatch(getRegionTypes(sortedRegionTypes));
    dispatch(getBranches(sortedBranches));
    dispatch(getBranchTypes(sortedBranchTypes));
    dispatch(getWarehouses(sortedWarehouses));
    dispatch(getWarehouseTypes(sortedWarehouseTypes));
    dispatch(getZones(sortedZones));
    dispatch(getZoneTypes(sortedZoneTypes));
    dispatch(getAreas(sortedAreas));
    dispatch(getAreaTypes(sortedAreaTypes));
    dispatch(getRooms(sortedRooms));
    dispatch(getRoomTypes(sortedRoomTypes));
    dispatch(getRows(sortedRows));
    dispatch(getRowTypes(sortedRowTypes));
    dispatch(getBays(sortedBays));
    dispatch(getBayTypes(sortedBayTypes));
    dispatch(getLevels(sortedLevels));
    dispatch(getLevelTypes(sortedLevelTypes));
    dispatch(getPositions(sortedPositions));
    dispatch(getPositionTypes(sortedPositionTypes));
    dispatch(getBins(sortedBins));
    dispatch(getBinTypes(sortedBinTypes));
    // }
    // setLoading(false);
    dispatch(updateLoadingStatus(false));
  }, [dispatch]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  useAuth({
    errorCallBack: () => {
      logout();
    },
    successCallBack: () => {
      //  setLoading(false);
    },
  });

  // if (loading) {
  //   return <LoadingPage/>;
  // } else
  return <Layout>{children}</Layout>;
};

export default AuthRoute;
