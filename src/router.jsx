import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./pages/Login";
import CheckUser from "./pages/CheckUser";
import AuthRoute from "./components/AuthRoute";
import { useSelector } from "react-redux";
import { Spin } from "antd";

//Dashboard
import Home from "./pages/Home";
//MainTable
import CurrentItemInventory from "./pages/main_tables/currentItemInventory/View";
import CreateItemInventory from "./pages/main_tables/currentItemInventory/Create";
import ItemBOM from "./pages/main_tables/itembom/ItemBOM";
import CreateItemBOM from "./pages/main_tables/itembom/CreateItemBOM";
import CreateRestock from "./pages/main_tables/restocking/Create";
import ViewRestock from "./pages/main_tables/restocking/View";
import RestockSummary from "./pages/main_tables/RestockSummary";
import InitiateRestock from "./pages/main_tables/InitiateRestock";
import ManualDailyInventoryCounts from "./pages/main_tables/ManualDailyInventoryCounts";
import AutomaticDailyInventoryCounts from "./pages/main_tables/AutomaticDailyInventoryCounts";
import DailyInventoryCounts from "./pages/main_tables/DailyInventoryCounts";
import InboundRegistration from "./pages/main_tables/InboundRegistration";
import OutboundRegistration from "./pages/main_tables/OutboundRegistration";
import Discrepancy from "./pages/main_tables/Discrepancy";
import DisposalInventory from "./pages/main_tables/DisposalInventory";

//Entities
import CreateCompany from './pages/entities/company/Create';
import Company from "./pages/entities/company/View";
import CreatePerson from "./pages/entities/person/Create";
import Person from "./pages/entities/person/View";
import CreateEntityEmbeddedDevice from './pages/entities/embeddedDevice/Create';
import EmbeddedDevice from "./pages/entities/embeddedDevice/View";
import CreateItemSKU from './pages/entities/itemsku/Create';
import ItemSKU from "./pages/entities/itemsku/View";
import Vehicle from "./pages/entities/Vehicle";
//Utilities
// import DeleteManager from "./pages/utilities/DeleteManager";
import DirectLabelPrinting from "./pages/utilities/DirectLabelPrinting";
// import ItemExternalTransfer from "./pages/utilities/ItemExternalTransfer";
// import ItemInternalTransfer from "./pages/utilities/ItemInternalTransfer";
// import ItemWeight from "./pages/utilities/ItemWeight";
// import OrderDetails from "./pages/utilities/OrderDetails";
// import OrderSummary from "./pages/utilities/OrderSummary";
// import SalesChannel from "./pages/utilities/SalesChannel";
import SettingsGenericConfig from "./pages/utilities/SettingsGenericConfig";
//Settings
//general
import SettingsReasons from "./pages/settings/general/SettingsReasons";
import SettingsReasonsType from "./pages/settings/general/SettingsReasonsType";
import SettingsStatus from "./pages/settings/general/SettingsStatus";
import SettingsAccessCode from "./pages/settings/general/SettingsAccessCode";
import SettingsRolesAndPermissions from "./pages/settings/general/SettingsRolesAndPermissions/SettingsRolesAndPermissions";
import CreateRolesAndPermissions from "./pages/settings/general/SettingsRolesAndPermissions/Create";
import SettingsCurrency from "./pages/settings/general/SettingsCurrency";
import SettingsReports from "./pages/settings/general/SettingsReports";
import SettingsCompanyType from "./pages/settings/general/SettingsCompanyType";
import SettingsItemCategory from "./pages/settings/general/SettingsItemCategory";
import SettingsItemSubCategory from "./pages/settings/general/SettingsItemSubCategory";
import SettingsItemType from "./pages/settings/general/SettingsItemType";
import SettingsItemSubType from "./pages/settings/general/SettingsItemSubType";
import SettingsUOM from "./pages/settings/general/SettingsUOM";
import SettingsHandlingUnit from "./pages/settings/general/SettingsHandlingUnit";
//location
import SettingsLocationCountryType from "./pages/settings/location/SettingsLocationCountryType";
import SettingsLocationCountry from "./pages/settings/location/SettingsLocationCountry";
import SettingsLocationRegionType from "./pages/settings/location/SettingsLocationRegionType";
import SettingsLocationRegion from "./pages/settings/location/SettingsLocationRegion";
import SettingsLocationBranchType from "./pages/settings/location/SettingsLocationBranchType";
import SettingsLocationBranch from "./pages/settings/location/SettingsLocationBranch";
import SettingsLocationWarehouseType from "./pages/settings/location/SettingsLocationWarehouseType";
import SettingsLocationWarehouse from "./pages/settings/location/SettingsLocationWarehouse";
import SettingsLocationZoneType from "./pages/settings/location/SettingsLocationZoneType";
import SettingsLocationZone from "./pages/settings/location/SettingsLocationZone";
import SettingsLocationAreaType from "./pages/settings/location/SettingsLocationAreaType";
import SettingsLocationArea from "./pages/settings/location/SettingsLocationArea";
import SettingsLocationRoomType from "./pages/settings/location/SettingsLocationRoomType";
import SettingsLocationRoom from "./pages/settings/location/SettingsLocationRoom";
import SettingsLocationRowType from "./pages/settings/location/SettingsLocationRowType";
import SettingsLocationRow from "./pages/settings/location/SettingsLocationRow";
import SettingsLocationBayType from "./pages/settings/location/SettingsLocationBayType";
import SettingsLocationBay from "./pages/settings/location/SettingsLocationBay";
import SettingsLocationLevelType from "./pages/settings/location/SettingsLocationLevelType";
import SettingsLocationLevel from "./pages/settings/location/SettingsLocationLevel";
import SettingsLocationPositionType from "./pages/settings/location/SettingsLocationPositionType";
import SettingsLocationPosition from "./pages/settings/location/SettingsLocationPosition";
import SettingsLocationBinType from "./pages/settings/location/SettingsLocationBinType";
import SettingsLocationBin from "./pages/settings/location/SettingsLocationBin";

import UpdateUserPassword from "./pages/UpdateUserPassword";

import { MyContextProvider } from "./utils/context";
import SettingsTransferType from "./pages/settings/general/SettingsTransferType";
import SettingsCostCenter from "./pages/settings/general/SettingsCostCenter";
import ForgetPassword from "./pages/ForgetPassword";
const Router = () => {
  let loadingStatus = useSelector((state) => state.loadingStatus.isLoading);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/check-user" exact component={CheckUser} />
        <Route path="/create-password" exact component={UpdateUserPassword} />
        <Route path="/forgot-password" exact component={ForgetPassword} />

        <Route
          path="/"
          render={() => (
            <AuthRoute>
              <div className="autoRouteWidth">
                {/* Dashboard */}

                <Route path="/" exact component={CurrentItemInventory} />

                {/* MainTable */}
                <Route
                  path="/current_item_inventory"
                  exact
                  component={CurrentItemInventory}
                />

                <Route
                  path="/create_current_item_inventory"
                  exact
                  component={CreateItemInventory}
                />
                <Route path="/itemBOM" exact component={ItemBOM} />
                <Route
                  path="/create_item_BOM"
                  exact
                  component={CreateItemBOM}
                />
                <Route path="/create_restock" exact component={CreateRestock} />
                <Route path="/view_restock" exact component={ViewRestock} />
                <Route
                  path="/restock_summary"
                  exact
                  component={RestockSummary}
                />
                <Route
                  path="/initiate_restock"
                  exact
                  render={() => (
                    <MyContextProvider>
                      <InitiateRestock />
                    </MyContextProvider>
                  )}
                />
                {/* <Route
                  path="/manual_daily_inventory_counts"
                  exact
                  component={ManualDailyInventoryCounts}
                />
                <Route
                  path="/automatic_daily_inventory_counts"
                  exact
                  component={AutomaticDailyInventoryCounts}
                /> */}
                <Route
                  path="/daily_inventory_counts"
                  exact
                  component={DailyInventoryCounts}
                />
                <Route path="/discrepancy" exact component={Discrepancy} />
                <Route
                  path="/disposal_inventory"
                  exact
                  component={DisposalInventory}
                />
                <Route
                  path="/inbound_registration"
                  exact
                  component={InboundRegistration}
                />
                <Route
                  path="/outbound_registration"
                  exact
                  component={OutboundRegistration}
                />

                {/* Entities */}
                <Route path="/create_person" exact component={CreatePerson} />
                <Route path="/persons" exact component={Person} />
                <Route path="/create_company" exact component={CreateCompany} />
                <Route path="/companies" exact component={Company} />
                <Route path="/itemSKU" exact component={ItemSKU} />
                <Route path="/create_itemSKU" exact component={CreateItemSKU} />
                <Route
                  path="/embedded_device"
                  exact
                  component={EmbeddedDevice}
                />
                <Route
                  path="/create_embedded_device"
                  exact
                  component={CreateEntityEmbeddedDevice}
                />
                <Route path="/vehicle" exact component={Vehicle} />

                {/* Utilities */}
                {/* <Route path="/delete_manager" exact component={DeleteManager} /> */}
                <Route
                  path="/direct_label_printing"
                  exact
                  component={DirectLabelPrinting}
                />
                {/* <Route
                  path="/item_external_transfer"
                  exact
                  component={ItemExternalTransfer}
                />
                <Route
                  path="/item_internal_transfer"
                  exact
                  component={ItemInternalTransfer}
                />
                <Route path="/item_weight" exact component={ItemWeight} />
                <Route path="/order_details" exact component={OrderDetails} />
                <Route path="/order_summary" exact component={OrderSummary} />
                <Route path="/sales_channel" exact component={SalesChannel} /> */}
                <Route
                  path="/settings_generic_config"
                  exact
                  component={SettingsGenericConfig}
                />

                {/* Settings */}

                {/* General */}
                <Route
                  path="/settings_reasons"
                  exact
                  component={SettingsReasons}
                />
                <Route
                  path="/settings_reasons_type"
                  exact
                  component={SettingsReasonsType}
                />
                <Route
                  path="/settings_status"
                  exact
                  component={SettingsStatus}
                />
                <Route
                  path="/settings_access_code"
                  exact
                  component={SettingsAccessCode}
                />
                <Route
                  path="/settings_roles_and_permissions"
                  exact
                  component={SettingsRolesAndPermissions}
                />
                <Route
                  path="/create_settings_roles_and_permissions"
                  exact
                  component={CreateRolesAndPermissions}
                />
                <Route
                  path="/settings_currency"
                  exact
                  component={SettingsCurrency}
                />
                <Route
                  path="/settings_transfer_type"
                  exact
                  component={SettingsTransferType}
                />
                <Route
                  path="/settings_cost_center"
                  exact
                  component={SettingsCostCenter}
                />
                <Route
                  path="/settings_reports"
                  exact
                  component={SettingsReports}
                />
                <Route
                  path="/settings_company_type"
                  exact
                  component={SettingsCompanyType}
                />
                <Route
                  path="/settings_item_category"
                  exact
                  component={SettingsItemCategory}
                />
                <Route
                  path="/settings_item_sub_category"
                  exact
                  component={SettingsItemSubCategory}
                />
                <Route
                  path="/settings_item_type"
                  exact
                  component={SettingsItemType}
                />
                <Route
                  path="/settings_item_sub_type"
                  exact
                  component={SettingsItemSubType}
                />
                <Route path="/settingsUOM" exact component={SettingsUOM} />
                <Route
                  path="/settings_handle_unit"
                  exact
                  component={SettingsHandlingUnit}
                />

                {/* Location */}
                <Route
                  path="/settings_location_country_type"
                  exact
                  component={SettingsLocationCountryType}
                />
                <Route
                  path="/settings_location_country"
                  exact
                  component={SettingsLocationCountry}
                />
                <Route
                  path="/settings_location_region_type"
                  exact
                  component={SettingsLocationRegionType}
                />
                <Route
                  path="/settings_location_region"
                  exact
                  component={SettingsLocationRegion}
                />
                <Route
                  path="/settings_location_branch_type"
                  exact
                  component={SettingsLocationBranchType}
                />
                <Route
                  path="/settings_location_branch"
                  exact
                  component={SettingsLocationBranch}
                />
                <Route
                  path="/settings_location_warehouse_type"
                  exact
                  component={SettingsLocationWarehouseType}
                />
                <Route
                  path="/settings_location_warehouse"
                  exact
                  component={SettingsLocationWarehouse}
                />
                <Route
                  path="/settings_location_zone_type"
                  exact
                  component={SettingsLocationZoneType}
                />
                <Route
                  path="/settings_location_zone"
                  exact
                  component={SettingsLocationZone}
                />
                <Route
                  path="/settings_location_area_type"
                  exact
                  component={SettingsLocationAreaType}
                />
                <Route
                  path="/settings_location_area"
                  exact
                  component={SettingsLocationArea}
                />
                <Route
                  path="/settings_location_room_type"
                  exact
                  component={SettingsLocationRoomType}
                />
                <Route
                  path="/settings_location_room"
                  exact
                  component={SettingsLocationRoom}
                />
                <Route
                  path="/settings_location_row_type"
                  exact
                  component={SettingsLocationRowType}
                />
                <Route
                  path="/settings_location_row"
                  exact
                  component={SettingsLocationRow}
                />
                <Route
                  path="/settings_location_bay_type"
                  exact
                  component={SettingsLocationBayType}
                />
                <Route
                  path="/settings_location_bay"
                  exact
                  component={SettingsLocationBay}
                />
                <Route
                  path="/settings_location_level_type"
                  exact
                  component={SettingsLocationLevelType}
                />
                <Route
                  path="/settings_location_level"
                  exact
                  component={SettingsLocationLevel}
                />
                <Route
                  path="/settings_location_position_type"
                  exact
                  component={SettingsLocationPositionType}
                />
                <Route
                  path="/settings_location_position"
                  exact
                  component={SettingsLocationPosition}
                />
                <Route
                  path="/settings_location_bin_type"
                  exact
                  component={SettingsLocationBinType}
                />
                <Route
                  path="/settings_location_bin"
                  exact
                  component={SettingsLocationBin}
                />
              </div>
            </AuthRoute>
          )}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
