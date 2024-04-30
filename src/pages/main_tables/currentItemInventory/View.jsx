import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button, Modal, Form, Input, Spin, Select, Popconfirm, Upload, Space } from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined, UploadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { CurrentItemInventoryUrl, BaseUrl, CurrentItemInventoryPaginatedUrl, DisposalInventoryUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { calcDaysDifference } from "../../../utils/dateHelper";
import { convertToLocalTime, comparebyUpdatedDateTime } from "../../../utils/dateHelper";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import { defaultColumnSorter, numberColumnSorter, dateColumnSorter } from "../../../components/generalTable/GeneralTableHelper";
import FilterModel from "../../../components/modals/FilterModel";

const WarningDays = 10;

const expiration = [
  {
    id: "expired",
    name: "Expired",
  },
  {
    id: "near_expired",
    name: "Near Expired",
  },
  {
    id: "not_expired",
    name: "Not Expired",
  },
];

const fifo = [
  {
    id: "FIFO",
    name: "FIFO",
  },
  {
    id: "FEFO",
    name: "FEFO",
  },
];

const CurrentItemInventory = () => {
  const history = useHistory();
  const status = useSelector((state) => state.settings.status);
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let companies = useSelector((state) => state.entities.companies);
  let UOMs = useSelector((state) => state.settings.UOMs);
  let persons = useSelector((state) => state.entities.persons);
  let handlingUnits = useSelector((state) => state.settings.handlingUnits);
  let countries = useSelector((state) => state.settings.countries);
  let regions = useSelector((state) => state.settings.regions);
  let branches = useSelector((state) => state.settings.branches);
  let warehouses = useSelector((state) => state.settings.warehouses);
  let zones = useSelector((state) => state.settings.zones);
  let types = useSelector((state) => state.settings.itemTypes);
  let subTypes = useSelector((state) => state.settings.itemSubTypes);
  let categories = useSelector((state) => state.settings.itemCategories);
  let subCategories = useSelector((state) => state.settings.itemSubCategories);
  let areas = useSelector((state) => state.settings.areas);
  let rooms = useSelector((state) => state.settings.rooms);
  let rows = useSelector((state) => state.settings.rows);
  let bays = useSelector((state) => state.settings.bays);
  let levels = useSelector((state) => state.settings.levels);
  let positions = useSelector((state) => state.settings.positions);
  let bins = useSelector((state) => state.settings.bins);
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  const costCenters = useSelector((state) => state.settings.costCenters);

  let tableName = CurrentItemInventoryUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let removeReasons = useSelector((state) => state.settings.reasons);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  const [data, setData] = useState([]);
  console.log("user permission ====>", userPerm);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [open, setOpen] = useState(false); //setting visible of popover
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState("Please select a reason");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsopen] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filter, setFilter] = useState({
    status: "",
    sku_id: "",
    accessCode: "",
    type_id: "",
    subtype_id: "",
    category_id: "",
    subcategory_id: "",
    code: "",
    cost_center_id: "",
    company_supplier_id: "",
    company_customer_id: "",
    person_supplier_id: "",
    person_customer_id: "",
    expiration_date: "",
  });

  const formItems = [
    { name: "status", label: "Status", data: status },
    { name: "sku_id", label: "SKU", data: itemSKUs },
    { name: "accessCode", label: "AccessCode", data: accessCodes },
    { name: "type_id", label: "Type Id", data: types },
    { name: "expiration_date", label: "Expiration", data: expiration },
    { name: "queue", label: "Queue", data: fifo },
    { name: "region_id", label: "Location", data: regions },
    { name: "subtype_id", label: "Sub Type", data: subTypes },
    { name: "category_id", label: "Category", data: categories },
    { name: "subcategory_id", label: "Sub Category", data: subCategories },
    { name: "generic_code", label: "Purchase/Request", data: subCategories },
    { name: "cost_center_id", label: "Cost Center", data: costCenters },
    { name: "company_supplier_id", label: "Supplier (Company)", data: companies },
    { name: "company_customer_id", label: "Customer (Company)", data: companies },
    { name: "person_supplier_id", label: "Supplier (Person)", data: persons },
    { name: "person_customer_id", label: "Customer (Person)", data: persons },
  ];

  const handleCancel = async () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    let value = {
      code: selectedItem.code,
      reasons: selectedReason,
    };
    let res = await CRUD("post", DisposalInventoryUrl, value, null);
    if (res) {
      let result = await CRUD("delete", CurrentItemInventoryUrl, null, selectedItem.id);
      if (result) {
        let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
        setData(res);
      }
    }
    setOpen(false);
  };

  const handleEdit = async (record) => {
    console.log("handle [edit]", record);
    history.push({
      pathname: "/create_current_item_inventory",
      state: { updatingCurrentItemInventory: record },
    });
  };

  const handleRowClassName = (record, index) => {
    if (!record.expiration_date) return "";
    const daysDiff = calcDaysDifference(record.expiration_date ?? "");
    if (daysDiff < 0) return "row-expire";
    else if (daysDiff < WarningDays) return "row-warning";
    return "";
  };

  const content = (
    <div>
      <Space direction="vertical">
        <span>Please select the reason</span>
        <Select style={{ width: "250px" }} onChange={(value) => setSelectedReason(value)} value={selectedReason} placeholder="Select Reason">
          {removeReasons.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.reasons}
            </Select.Option>
          ))}
        </Select>
      </Space>
    </div>
  );

  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl = BaseUrl + `api/CurrentItemInventory/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      setData(res);
      setAllData(res);
    } else {
      let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
      // let res = await CRUD("get", CurrentItemInventoryPaginatedUrl, null, null);
      setData(res);
      setAllData(res);
    }
  };
  //Sort Operation

  const getItem = useCallback(async () => {
    //loading modal delay
    if (isLoading) {
      setVisible(true);
    } else {
      setTimeout(() => {
        setVisible(false);
      }, 1000);
    }
    //loading data
    if (loading) {
      let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
      console.log("res", res);
      setData(res);
      setAllData(res);
    }
    const response = await CRUD("get", CurrentItemInventoryUrl, null, null);
    if (response) {
      console.log("view response", response);

      const sortedData = response.sort(comparebyUpdatedDateTime);
      console.log("view sorted response", sortedData);
      setData(sortedData);
      setAllData(sortedData);
    } else {
      setData([]);
      setAllData([]);
    }
    setLoading(false);
  }, [isLoading, loading]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",

      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <div>
          {userPerm && userPerm.perm_delete_main === "1" ? (
            <Popconfirm
              title={content}
              // open={open}
              onConfirm={handleDelete}
              onCancel={handleCancel}
            >
              <Button
                type="circle"
                style={{
                  color: "white",
                  background: "green",
                }}
                onClick={() => {
                  setSelectedItem(record);
                  setOpen(true);
                  setTimeout(() => {
                    const popovers = document.querySelectorAll(".ant-popover");
                    popovers.forEach((popover) => {
                      popover.style.width = "300px"; // Set your desired width
                    });
                  }, 0);
                }}
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          ) : null}
          {userPerm && userPerm.perm_delete_main === "1" ? (
            <Popconfirm
              title={"Are you going to update?"}
              // open={open}
              onConfirm={() => handleEdit(record)}
              onCancel={() => {}}
            >
              <Button
                type="circle"
                style={{
                  color: "white",
                  background: "green",
                }}
              >
                <EditOutlined />
              </Button>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "name",
      dataIndex: "name",
      key: "name",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("name"),
    },
    {
      title: "AccessCode",
      dataIndex: "accessCode",
      key: "accessCode",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("accessCode"),

      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Type",
      dataIndex: "type_id",
      key: "type_id",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = types.find((item) => item.id === record.type_id);
        return res?.name ?? "";
      },
    },
    {
      title: "SubType",
      dataIndex: "subtype_id",
      key: "subtype_id",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = subTypes.find((item) => item.id === record.subtype_id);
        return res?.name ?? "";
      },
    },
    {
      title: "Category",
      dataIndex: "category_id",
      key: "category_id",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = categories.find((item) => item.id === record.category_id);
        return res?.name ?? "";
      },
    },
    {
      title: "SubCategory",
      dataIndex: "subcategory_id",
      key: "subcategory_id",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = subCategories.find((item) => item.id === record.subcategory_id);
        return res?.name ?? "";
      },
    },
    {
      title: "FIFO",
      dataIndex: "fifo",
      key: "fifo",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        return record.fifo ? "true" : "false";
      },
    },
    {
      title: "FEFO",
      dataIndex: "fefo",
      key: "fefo",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        return record.fefo ? "true" : "false";
      },
    },
    {
      title: "Purchase/Request Code",
      dataIndex: "generic_code",
      key: "generic_code",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("generic_code"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("description"),
    },
    {
      title: "Lot Code",
      dataIndex: "lot_number",
      key: "lot_number",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("lot_number"),
    },
    {
      title: "Batch Code",
      dataIndex: "batch_number",
      key: "batch_number",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("accessCode"),
    },
    // {
    //   title: "Image Url",
    //   dataIndex: "image_url",
    //   key: "image_url",
    // sortDirections: ["descend", "ascend"],
    // sorter: defaultColumnSorter("accessCode"),

    // },
    {
      title: "Cost Center",
      dataIndex: "cost_center_id",
      key: "cost_center_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("cost_center_id"),

      render: (_, record, index) => {
        let res = costCenters?.filter((cc) => cc.id === record.cost_center_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Transfer Type",
      dataIndex: "transfer_type_id",
      key: "transfer_type_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("transfer_type_id"),

      // render: (_, record, index) => {
      //   let res = costCenters?.filter((cc) => cc.id === record.cost_center_id);
      //   return res.length > 0 ? res[0].name : "";
      // },
    },
    {
      title: "SkuId",
      dataIndex: "sku_id",
      key: "sku_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("sku_id"),

      render: (_, record, index) => {
        let res = itemSKUs?.filter((item) => item.id === record.sku_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    // {
    //   title: "HasBom",
    //   dataIndex: "has_bom",
    //   key: "has_bom",
    // sortDirections: ["descend", "ascend"],
    // sorter: defaultColumnSorter("accessCode"),

    //   render: (_, record, index) => {
    //     return record.has_bom ? "true" : "false";
    //   },
    // },
    {
      title: "CompanySupplierId",
      dataIndex: "company_supplier_id",
      key: "supplier_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("supplier_id"),

      render: (_, record, index) => {
        let res = companies?.filter((item) => item.id === record.company_supplier_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "CompanyCustomerId",
      dataIndex: "company_customer_id",
      key: "customer_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("customer_id"),

      render: (_, record, index) => {
        let res = companies?.filter((item) => item.id === record.company_customer_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "PersonCustomerId",
      dataIndex: "person_supplier_id",
      key: "person_supplier_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("person_supplier_id"),

      render: (_, record, index) => {
        let res = persons?.filter((item) => item.id === record.person_supplier_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "PersonCustomerId",
      dataIndex: "person_customer_id",
      key: "person_customer_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("person_customer_id"),

      render: (_, record, index) => {
        let res = persons?.filter((item) => item.id === record.person_customer_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "RegularQtyReceived",
      dataIndex: "regular_net_qty_received",
      key: "regular_net_qty_received",
      sortDirections: ["descend", "ascend"],
      sorter: numberColumnSorter("regular_net_qty_received"),
    },
    {
      title: "RegularQtyRemaining",
      dataIndex: "regular_net_qty_remaining",
      key: "regular_net_qty_remaining",
      sortDirections: ["descend", "ascend"],
      sorter: numberColumnSorter("regular_net_qty_remaining"),
    },
    {
      title: "RegularUOMId",
      dataIndex: "regular_uom_id",
      key: "regular_uom_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("regular_uom_id"),

      render: (_, record, index) => {
        let res = UOMs?.filter((item) => item.id === record.regular_uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "EachesQtyReceived",
      dataIndex: "eaches_net_qty_received",
      key: "eaches_net_qty_received",
      sortDirections: ["descend", "ascend"],
      sorter: numberColumnSorter("eaches_net_qty_received"),
    },
    {
      title: "EachesQtyRemaining",
      dataIndex: "eaches_net_qty_remaining",
      key: "eaches_net_qty_remaining",
      sortDirections: ["descend", "ascend"],
      sorter: numberColumnSorter("eaches_net_qty_remaining"),
    },
    {
      title: "EachesReceivedUOMId",
      dataIndex: "eaches_received_uom_id",
      key: "eaches_received_uom_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("eaches_received_uom_id"),

      render: (_, record, index) => {
        let res = UOMs?.filter((item) => item.id === record.eaches_received_uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "EachesRemainingUOMId",
      dataIndex: "eaches_remaining_uom_id",
      key: "eaches_remaining_uom_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("eaches_remaining_uom_id"),

      render: (_, record, index) => {
        let res = UOMs?.filter((item) => item.id === record.eaches_remaining_uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "TopHandlingUnitId",
      dataIndex: "top_handling_unit_id",
      key: "top_handling_unit_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("top_handling_unit_id"),

      render: (_, record, index) => {
        let res = handlingUnits?.filter((item) => item.id === record.top_handling_unit_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "NoTopHandlingUnit",
      dataIndex: "no_top_handling_unit",
      key: "no_top_handling_unit",
      sortDirections: ["descend", "ascend"],
      sorter: numberColumnSorter("no_top_handling_unit"),
    },
    {
      title: "BottomHandlingUnitId",
      dataIndex: "bottom_handling_unit_id",
      key: "bottom_handling_unit_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("bottom_handling_unit_id"),

      render: (_, record, index) => {
        let res = handlingUnits?.filter((item) => item.id === record.bottom_handling_unit_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "NoBottomHandlingUnit",
      dataIndex: "no_bottom_handling_unit",
      key: "no_bottom_handling_unit",
      sortDirections: ["descend", "ascend"],
      sorter: numberColumnSorter("no_bottom_handling_unit"),
    },
    {
      title: "CountryId",
      dataIndex: "country_id",
      key: "country_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("country_id"),

      render: (_, record, index) => {
        let res = countries?.filter((item) => item.id === record.country_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "RegionId",
      dataIndex: "region_id",
      key: "region_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("region_id"),

      render: (_, record, index) => {
        let res = regions?.filter((item) => item.id === record.region_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "BranchId",
      dataIndex: "branch_id",
      key: "branch_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("branch_id"),

      render: (_, record, index) => {
        let res = branches?.filter((item) => item.id === record.branch_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "WarehouseId",
      dataIndex: "warehouse_id",
      key: "warehouse_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("warehouse_id"),

      render: (_, record, index) => {
        let res = warehouses?.filter((item) => item.id === record.warehouse_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "ZoneId",
      dataIndex: "zone_id",
      key: "zone_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("zone_id"),

      render: (_, record, index) => {
        let res = zones?.filter((item) => item.id === record.zone_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "AreaId",
      dataIndex: "area_id",
      key: "area_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("area_id"),

      render: (_, record, index) => {
        let res = areas?.filter((item) => item.id === record.area_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "RoomId",
      dataIndex: "room_id",
      key: "room_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("room_id"),

      render: (_, record, index) => {
        let res = rooms?.filter((item) => item.id === record.room_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "RowId",
      dataIndex: "row_id",
      key: "row_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("row_id"),

      render: (_, record, index) => {
        let res = rows?.filter((item) => item.id === record.row_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "BayId",
      dataIndex: "bay_id",
      key: "bay_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("bay_id"),

      render: (_, record, index) => {
        let res = bays?.filter((item) => item.id === record.bay_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "LevelId",
      dataIndex: "level_id",
      key: "level_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("level_id"),

      render: (_, record, index) => {
        let res = levels?.filter((item) => item.id === record.level_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "PositionId",
      dataIndex: "position_id",
      key: "position_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("position_id"),

      render: (_, record, index) => {
        let res = positions?.filter((item) => item.id === record.position_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "BinId",
      dataIndex: "bin_id",
      key: "bin_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("bin_id"),

      render: (_, record, index) => {
        let res = bins?.filter((item) => item.id === record.bin_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "ManufacturingDate",
      dataIndex: "manufacturing_date",
      key: "manufacturing_date",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("manufacturing_date"),
    },
    {
      title: "SlaughterDate",
      dataIndex: "slaughter_date",
      key: "slaughter_date",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("slaughter_date"),
    },
    {
      title: "ProductionDate",
      dataIndex: "production_date",
      key: "production_date",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("production_date"),
    },
    {
      title: "ProcessingDate",
      dataIndex: "processing_date",
      key: "processing_date",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("processing_date"),
    },
    {
      title: "DatetimeIn",
      dataIndex: "datetime_in",
      key: "datetime_in",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("datetime_in"),
    },
    {
      title: "DatetimeOut",
      dataIndex: "datetime_out",
      key: "datetime_out",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("datetime_out"),
    },
    {
      title: "Expiration Date",
      dataIndex: "expiration_date",
      key: "expiration_date",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("expiration_date"),
    },
    {
      title: "CreatedDate Time",
      dataIndex: "created_datetime",
      key: "created_datetime",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("created_datetime"),
    },
    {
      title: "PersonIdCreatedBy",
      dataIndex: "person_id_createdby",
      key: "person_id_createdby",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("person_id_createdby"),

      render: (_, record, index) => {
        let res = persons.filter((item) => item.id === record.person_id_createdby);
        return res.length > 0 ? res[0].user_name : "";
      },
    },
    {
      title: "UpdatedDate Time",
      dataIndex: "updated_datetime",
      key: "updated_datetime",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("updated_datetime"),
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("person_id_updatedby"),

      render: (_, record, index) => {
        let res = persons.filter((item) => item.id === record.person_id_updatedby);
        return res.length > 0 ? res[0].user_name : "";
      },
    },
  ];

  const processDataForExcel = () => {
    return data.map((record) => {
      const { status, category_id, subcategory_id, type_id, subtype_id, ...updatedRecord } = record;
      const selAccessCode = accessCodes.find((item) => item.id === record.accessCode);
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);

      const selCostCenter = costCenters?.find((cc) => cc.id === record.cost_center_id);
      selCostCenter && (updatedRecord.cost_center_id = selAccessCode.name);

      const selSKU = itemSKUs.find((item) => item.id === record.sku_id);
      selSKU && (updatedRecord.sku_id = selSKU.name);

      const selCompanySupplier = companies?.find((item) => item.id === record.company_supplier_id);
      selCompanySupplier && (updatedRecord.company_supplier_id = selCompanySupplier.name);

      let selCompanyCustomer = companies?.find((item) => item.id === record.company_customer_id);
      selCompanyCustomer && (updatedRecord.company_customer_id = selCompanyCustomer.name);

      const selPersonSupplier = persons?.find((item) => item.id === record.person_supplier_id);
      selPersonSupplier && (updatedRecord.person_supplier_id = selPersonSupplier.name);

      let selPersonCustomer = persons?.find((item) => item.id === record.person_customer_id);
      selPersonCustomer && (updatedRecord.person_customer_id = selPersonCustomer.name);

      let regularUOM = UOMs?.find((item) => item.id === record.regular_uom_id);
      regularUOM && (updatedRecord.regular_uom_id = regularUOM.name);

      let eachesReceivedUOM = UOMs?.find((item) => item.id === record.eaches_received_uom_id);
      eachesReceivedUOM && (updatedRecord.eaches_received_uom_id = eachesReceivedUOM.name);

      let eachesRemainingUOM = UOMs?.find((item) => item.id === record.eaches_remaining_uom_id);
      eachesRemainingUOM && (updatedRecord.eaches_remaining_uom_id = eachesRemainingUOM.name);

      let selTopHandlingUnit = handlingUnits?.find((item) => item.id === record.top_handling_unit_id);
      selTopHandlingUnit && (updatedRecord.top_handling_unit_id = selTopHandlingUnit.name);

      let selBottomHandlingUnit = handlingUnits?.find((item) => item.id === record.bottom_handling_unit_id);
      selBottomHandlingUnit && (updatedRecord.bottom_handling_unit_id = selBottomHandlingUnit.name);

      let selCountry = countries?.find((item) => item.id === record.country_id);
      selCountry && (updatedRecord.country_id = selCountry.name);

      let selRegion = regions?.find((item) => item.id === record.region_id);
      selRegion && (updatedRecord.region_id = selRegion.name);

      let selBranch = branches?.find((item) => item.id === record.branch_id);
      selBranch && (updatedRecord.branch_id = selBranch.name);

      let selWarehouse = warehouses?.find((item) => item.id === record.warehouse_id);
      selWarehouse && (updatedRecord.warehouse_id = selWarehouse.name);

      let selZone = zones?.find((item) => item.id === record.zone_id);
      selZone && (updatedRecord.zone_id = selZone.name);

      let selArea = areas?.find((item) => item.id === record.area_id);
      selArea && (updatedRecord.area_id = selArea.name);

      let selRoom = rooms?.find((item) => item.id === record.room_id);
      selRoom && (updatedRecord.room_id = selRoom.name);

      let selRow = rows?.find((item) => item.id === record.row_id);
      selRow && (updatedRecord.row_id = selRow.name);

      let selBay = bays?.find((item) => item.id === record.bay_id);
      selBay && (updatedRecord.bay_id = selBay.name);

      let selLevel = levels?.find((item) => item.id === record.level_id);
      selLevel && (updatedRecord.level_id = selLevel.name);

      let selPosition = positions?.find((item) => item.id === record.position_id);
      selPosition && (updatedRecord.position_id = selPosition.name);

      let selBin = bins?.find((item) => item.id === record.bin_id);
      selBin && (updatedRecord.bin_id = selBin.name);

      let selPersonCreatedBy = persons.find((item) => item.id === record.person_id_createdby);
      selPersonCreatedBy && (updatedRecord.person_id_createdby = selPersonCreatedBy.user_name);
      let selPersonUpdatedBy = persons.find((item) => item.id === record.person_id_updatedby);
      selPersonUpdatedBy && (updatedRecord.person_id_updatedby = selPersonUpdatedBy.user_name);
      return updatedRecord;
    });
  };

  const onOpenFilterModel = () => {
    setIsopen(true);
  };

  const handleOnapplyFilters = () => {
    const filteredArray = allData?.filter((item) => {
      return Object.keys(filter).every((key) => {
        if (key === "expiration_date") {
          let givenDate = new Date(item[key]);
          let currentDate = new Date();
          if (filter[key] === "expired" && isExpired(givenDate)) {
            return item;
          } else if (filter[key] === "near_expired" && isNearExpired(givenDate, 24 * 60 * 60 * 1000)) {
            return item;
          } else if (filter[key] === "not_expired" && givenDate > currentDate) {
            return item;
          } else {
            return filter[key] === "";
          }
        } else if (key === "queue") {
          if (filter[key] === "FIFO") {
            return filter[key] === "" || item.fifo === true;
          } else if (filter[key] === "FEFO") {
            return filter[key] === "" || item.fefo === true;
          } else {
            return filter[key] === "";
          }
        } else {
          return filter[key] === "" || item[key] === filter[key];
        }
      });
    });
    setData(filteredArray);
    setIsopen(false);
  };

  const isExpired = (date) => {
    return new Date() > new Date(date);
  };

  // Function to check if a date is near expired
  const isNearExpired = (date, thresholdInMilliseconds) => {
    var currentDate = new Date();
    var givenDate = new Date(date);
    var difference = givenDate.getTime() - currentDate.getTime();
    return difference > 0 && difference <= thresholdInMilliseconds;
  };

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="CurrentItemInventory"
            titleRightAction={() =>
              userPerm && userPerm.perm_create_main === "1" ? (
                <Button
                  type="circle"
                  style={{
                    color: "white",
                    background: "green",
                  }}
                  onClick={() => {
                    history.push("/create_current_item_inventory");
                  }}
                >
                  <PlusOutlined style={{ size: 20 }} />
                </Button>
              ) : null
            }
          >
            <GeneralTable
              data={data}
              columns={columns}
              onSearch={onSearch}
              onRefresh={refresh}
              rowClassName={handleRowClassName}
              // onUpload={(options) => customRequest(options, tableName)}
              processDataForExcel={processDataForExcel}
              paperSize="A1"
              onOpenFilterModel={onOpenFilterModel}
            />
          </PageLayout>

          <Modal title="Loading Data" open={visible} footer={null}>
            <Loading />
          </Modal>

          <Modal
            title="Appy Filters"
            open={isOpen}
            onCancel={() => setIsopen(false)}
            footer={[
              <Button key="submit" type="primary" size="large" onClick={handleOnapplyFilters}>
                Apply
              </Button>,
            ]}
          >
            <FilterModel setFilter={setFilter} formItems={formItems} />
          </Modal>
        </div>
      )}
    </>
  );
};

export default CurrentItemInventory;
