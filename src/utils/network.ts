const Domain = JSON.parse(localStorage.getItem("domain")!);
// export const BaseUrl = `http://abakada.tech:89/`;
export const BaseUrl = `http://abakada.tech:89/honeycomb/`;

// export const BaseUrl = `${Domain}/honeycomb/`;
export const SortUrl = `&sort_field=updated_datetime&sort_direction=ascending`;
export const UploadApiUrl = `${Domain}/media/upload/`

// Token
export const LoginUrl = BaseUrl + "api/token/";
export const MeUrl = BaseUrl + "api/EntityPerson/";
export const CreateUserUrl = BaseUrl + "api/EntityPersonRegister/";
export const ForgetPasswordUrl = BaseUrl + "api/request-password-reset/";

// Utilities
export const SettingsGenericConfigUrl = BaseUrl + "api/SettingsGenericConfig/";
export const DirectLabelPrintingUrl = BaseUrl + "api/DirectLabelPrinting/";
export const DeleteManagerUrl = BaseUrl + "api/DeleteManager/";
export const LastItemCounterUrl = BaseUrl + "api/LastItemCounter/";
export const ItemWeightUrl = BaseUrl + "api/ItemWeight/";
export const SalesChannelUrl = BaseUrl + "api/SalesChannel/";
export const OrderSummaryUrl = BaseUrl + "api/OrderSummary/";
export const OrderDetailsUrl = BaseUrl + "api/OrderDetails/";

// Main
export const CurrentItemInventoryPaginatedUrl =
  BaseUrl + "api/CurrentItemInventoryPaginated/";
export const CurrentItemInventoryUrl =
  BaseUrl + "api/CurrentItemInventory/";
export const ItemBOMPaginatedUrl = BaseUrl + "api/ItemBOMPaginated/";
export const ItemBOMUrl = BaseUrl + "api/ItemBOM/";
export const RestockSummaryPaginatedUrl =
  BaseUrl + "api/RestockSummaryPaginated/";
export const RestockSummaryUrl = BaseUrl + "api/RestockSummary/";
export const RestockItemsPaginatedUrl = BaseUrl + "api/RestockItemsPaginated/";
export const RestockItemsUrl = BaseUrl + "api/RestockItems/";
export const RestockDetailsUrl = BaseUrl + "api/RestockDetails/";
export const RestockDetailsPaginatedUrl = BaseUrl + "api/RestockDetailsPaginated/";
export const SettingsCostCenterUrl = BaseUrl + "api/SettingsCostCenter/";
export const ItemInternalTransferPaginatedUrl =
  BaseUrl + "api/ItemInternalTransferPaginated/";
export const ItemInternalTransferUrl = BaseUrl + "api/ItemInternalTransfer/";
export const ItemExternalTransferPaginatedUrl =
  BaseUrl + "api/ItemExternalTransferPaginated/";
export const ItemExternalTransferUrl = BaseUrl + "api/ItemExternalTransfer/";
export const ManualDailyInventoryCountsPaginatedUrl =
  BaseUrl + "api/ManualDailyInventoryCountsPaginated/";
export const ManualDailyInventoryCountsUrl =
  BaseUrl + "api/ManualDailyInventoryCounts/";
export const AutomaticDailyInventoryCountsPaginatedUrl =
  BaseUrl + "api/AutomaticDailyInventoryCountsPaginated/";
export const AutomaticDailyInventoryCountsUrl =
  BaseUrl + "api/AutomaticDailyInventoryCounts/";
export const DailyInventoryCountsPaginatedUrl =
  BaseUrl + "api/DailyInventoryCountsPaginated/";
export const DailyInventoryCountsUrl =
  BaseUrl + "api/DailyInventoryCounts/";
export const InboundRegistrationPaginatedUrl =
  BaseUrl + "api/InboundRegistrationPaginated/";
export const InboundRegistrationUrl = BaseUrl + "api/InboundRegistration/";
export const OutboundRegistrationPaginatedUrl =
  BaseUrl + "api/OutboundRegistrationPaginated/";
export const OutboundRegistrationUrl = BaseUrl + "api/OutboundRegistration/";
export const DisposalInventoryUrl = BaseUrl + "api/DisposalInventory/";

// Entities
export const EntityPersonPaginatedUrl = BaseUrl + "api/EntityPersonPaginated/";
export const EntityPersonUrl = BaseUrl + "api/EntityPerson/";
export const EntityCompanyPaginatedUrl =
  BaseUrl + "api/EntityCompanyPaginated/";
export const EntityCompanyUrl = BaseUrl + "api/EntityCompany/";
export const EntityVehiclePaginatedUrl =
  BaseUrl + "api/EntityVehiclePaginated/";
export const EntityVehicleUrl = BaseUrl + "api/EntityVehicle/";
export const EntityItemSKUPaginatedUrl =
  BaseUrl + "api/EntityItemSKUPaginated/";
export const EntityItemSKUUrl = BaseUrl + "api/EntityItemSKU/";
export const EntityEmbeddedDeviceUrl = BaseUrl + "api/EntityEmbeddedDevice/";
export const EntityEmbeddedDevicePaginatedUrl =
  BaseUrl + "api/EntityEmbeddedDevicePaginated/";

//Settings - General
export const SettingsRolesAndPermissionsUrl =
  BaseUrl + "api/SettingsRolesAndPermissions/";
export const SettingsRolesAndPermissionsPaginatedUrl =
  BaseUrl + "api/SettingsRolesAndPermissionsPaginated/";
export const SettingsCurrencyUrl = BaseUrl + "api/SettingsCurrency/";
export const SettingsTransferTypeUrl = BaseUrl + "api/SettingsTransferType/";
export const SettingsReportsUrl = BaseUrl + "api/SettingsReports/";
export const SettingsReportsPaginatedUrl =
  BaseUrl + "api/SettingsReportsPaginated/";
export const SettingsItemCategoryUrl = BaseUrl + "api/SettingsItemCategory/";
export const SettingsItemCategoryPaginatedUrl =
  BaseUrl + "api/SettingsItemCategoryPaginated/";
export const SettingsItemSubCategoryUrl =
  BaseUrl + "api/SettingsItemSubCategory/";
export const SettingsItemSubCategoryPaginatedUrl =
  BaseUrl + "api/SettingsItemSubCategoryPaginated/";
export const SettingsItemTypeUrl = BaseUrl + "api/SettingsItemType/";
export const SettingsItemTypePaginatedUrl =
  BaseUrl + "api/SettingsItemTypePaginated/";
export const SettingsItemSubTypeUrl = BaseUrl + "api/SettingsItemSubType/";
export const SettingsItemSubTypePaginatedUrl =
  BaseUrl + "api/SettingsItemSubTypePaginated/";
export const SettingsUOMUrl = BaseUrl + "api/SettingsUOM/";
export const SettingsUOMPaginatedUrl = BaseUrl + "api/SettingsUOMPaginated/";
export const SettingsHandlingUnitUrl = BaseUrl + "api/SettingsHandlingUnit/";
export const SettingsHandlingUnitPaginatedUrl =
  BaseUrl + "api/SettingsHandlingUnitPaginated/";
export const SettingsStatusUrl = BaseUrl + "api/SettingsStatus/";
export const SettingsAccessCodeUrl = BaseUrl + "api/SettingsAccessCode/";
export const SettingsStatusPaginatedUrl =
  BaseUrl + "api/SettingsStatusPaginated/";
export const SettingsCompanyTypeUrl = BaseUrl + "api/SettingsCompanyType/";
export const SettingsReasonsUrl = BaseUrl + "api/SettingsReasons/";
export const SettingsReasonsTypeUrl = BaseUrl + "api/SettingsReasonsType/";

//Settings - Location
export const SettingsLocationCountryUrl =
  BaseUrl + "api/SettingsLocationCountry/";
export const SettingsLocationCountryTypeUrl =
  BaseUrl + "api/SettingsLocationCountryType/";
export const SettingsLocationCountryPaginatedUrl =
  BaseUrl + "api/SettingsLocationCountryPaginated/";
export const SettingsLocationRegionUrl =
  BaseUrl + "api/SettingsLocationRegion/";
export const SettingsLocationRegionTypeUrl =
  BaseUrl + "api/SettingsLocationRegionType/";
export const SettingsLocationRegionPaginatedUrl =
  BaseUrl + "api/SettingsLocationRegionPaginated/";
export const SettingsLocationBranchUrl =
  BaseUrl + "api/SettingsLocationBranch/";
export const SettingsLocationBranchTypeUrl =
  BaseUrl + "api/SettingsLocationBranchType/";
export const SettingsLocationBranchPaginatedUrl =
  BaseUrl + "api/SettingsLocationBranchPaginated/";
export const SettingsLocationWarehouseUrl =
  BaseUrl + "api/SettingsLocationWarehouse/";
export const SettingsLocationWarehouseTypeUrl =
  BaseUrl + "api/SettingsLocationWarehouseType/";
export const SettingsLocationWarehousePaginatedUrl =
  BaseUrl + "api/SettingsLocationWarehousePaginated/";
export const SettingsLocationZoneUrl = BaseUrl + "api/SettingsLocationZone/";
export const SettingsLocationZoneTypeUrl =
  BaseUrl + "api/SettingsLocationZoneType/";
export const SettingsLocationZonePaginatedUrl =
  BaseUrl + "api/SettingsLocationZonePaginated/";
export const SettingsLocationAreaUrl = BaseUrl + "api/SettingsLocationArea/";
export const SettingsLocationAreaPaginatedUrl =
  BaseUrl + "api/SettingsLocationAreaPaginated/";
export const SettingsLocationAreaTypeUrl =
  BaseUrl + "api/SettingsLocationAreaType/";
export const SettingsLocationRoomUrl = BaseUrl + "api/SettingsLocationRoom/";
export const SettingsLocationRoomTypeUrl =
  BaseUrl + "api/SettingsLocationRoomType/";
export const SettingsLocationRoomPaginatedUrl =
  BaseUrl + "api/SettingsLocationRoomPaginated/";
export const SettingsLocationRowUrl = BaseUrl + "api/SettingsLocationRow/";
export const SettingsLocationRowTypeUrl =
  BaseUrl + "api/SettingsLocationRowType/";
export const SettingsLocationRowPaginatedUrl =
  BaseUrl + "api/SettingsLocationRowPaginated/";
export const SettingsLocationBayUrl = BaseUrl + "api/SettingsLocationBay/";
export const SettingsLocationBayTypeUrl =
  BaseUrl + "api/SettingsLocationBayType/";
export const SettingsLocationBayPaginatedUrl =
  BaseUrl + "api/SettingsLocationBayPaginated/";
export const SettingsLocationLevelUrl = BaseUrl + "api/SettingsLocationLevel/";
export const SettingsLocationLevelTypeUrl =
  BaseUrl + "api/SettingsLocationLevelType/";
export const SettingsLocationLevelPaginatedUrl =
  BaseUrl + "api/SettingsLocationLevelPaginated/";
export const SettingsLocationPositionUrl =
  BaseUrl + "api/SettingsLocationPosition/";
export const SettingsLocationPositionTypeUrl =
  BaseUrl + "api/SettingsLocationPositionType/";
export const SettingsLocationPositionPaginatedUrl =
  BaseUrl + "api/SettingsLocationPositionPaginated/";
export const SettingsLocationBinUrl = BaseUrl + "api/SettingsLocationBin/";
export const SettingsLocationBinTypeUrl =
  BaseUrl + "api/SettingsLocationBinType/";
export const SettingsLocationBinPaginatedUrl =
  BaseUrl + "api/SettingsLocationBinPaginated/";

export const UsersUrl = BaseUrl + "user/users";
export const CompaniesUrl = BaseUrl + "user/companies";

export const UpdatePasswordUrl = BaseUrl + "user/update-password";
export const ChangePasswordUrl = BaseUrl + "api/change-password/";
export const ActivitiesUrl = BaseUrl + "user/activities-log";

export const GroupUrl = BaseUrl + "app/group";
export const InventoryUrl = BaseUrl + "app/inventory";
export const InventoryCSVUrl = BaseUrl + "app/inventory-csv";
export const ShopUrl = BaseUrl + "app/shop";
export const InvoiceUrl = BaseUrl + "app/invoice";
export const SummaryUrl = BaseUrl + "app/summary";
export const TopSellUrl = BaseUrl + "app/top-selling";
export const ShopSaleUrl = BaseUrl + "app/sales-by-shop";
export const PurchaseSummaryUrl = BaseUrl + "app/purchase-summary";

export const CloudinaryUrl =
  "https://api.cloudinary.com/v1_1/adefemigreat/upload";
