import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Popconfirm,
  Select,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { EntityItemSKUUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getItemSKUs } from "../../../redux/slice";
import { useReactToPrint } from "react-to-print";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const { Search } = Input;

const ItemSKU = () => {
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);

  const [UOMs, setUOMs] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [itemSubCategories, setItemSubCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [itemSubTypes, setItemSubTypes] = useState([]);
  const [searchValue, setSearchValue] = useState(null);

  const dispatch = useDispatch();
  const history = useHistory();
  const tableRef = useRef();
  let persons = useSelector((state) => state.entities.persons);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = EntityItemSKUUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let initUOMs = useSelector((state) => state.settings.UOMs);
  let initItemTypes = useSelector((state) => state.settings.itemTypes);
  let initItemSubTypes = useSelector((state) => state.settings.itemSubTypes);
  let initItemCategories = useSelector(
    (state) => state.settings.itemCategories
  );
  let initItemSubCategories = useSelector(
    (state) => state.settings.itemSubCategories
  );

  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl + `api/EntityItemSKU/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getItemSKUs(res));
    } else {
      let res = await CRUD("get", EntityItemSKUUrl, null, null);
      dispatch(getItemSKUs(res));
    }
  };

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    pageStyle: `
      @page {
        size: auto;
        margin: 0mm;
      }
      body {
        background-color: white;
        margin: 0px;
      }
    `,
  });

  const handleDelete = async (record) => {
    let result = await CRUD("delete", EntityItemSKUUrl, record, record.id);
    if (result) {
      let res = await CRUD("get", EntityItemSKUUrl, null, null);
      dispatch(getItemSKUs(res));
    }
  };

  const handleCreate = () => {
    history.push("/create_itemSKU");
  };

  const handleEdit = (record) => {
    console.log("Edit item SKU edit record ===>", record);
    history.push({
      pathname: "/create_itemSKU",
      state: { updatingEntityItemSKU: record },
    });
    return;
  };

  const getItem = useCallback(async () => {
    //loading modal delay
    if (isLoading) {
      setVisible(true);
    } else {
      setTimeout(() => {
        setVisible(false);
      }, 1000);
    }
    if (loading) {
      let res = await CRUD("get", EntityItemSKUUrl, null, null);
      dispatch(getItemSKUs(res));
    }
    initUOMs && initUOMs.length > 0 ? setUOMs(initUOMs) : setUOMs([]);
    initItemTypes && initItemTypes.length > 0
      ? setItemTypes(initItemTypes)
      : setItemTypes([]);
    initItemSubTypes && initItemSubTypes.length > 0
      ? setItemSubTypes(initItemSubTypes)
      : setItemSubTypes([]);
    initItemCategories && initItemCategories.length > 0
      ? setItemCategories(initItemCategories)
      : setItemCategories([]);
    initItemSubCategories && initItemSubCategories.length > 0
      ? setItemSubCategories(initItemSubCategories)
      : setItemSubCategories([]);
    itemSKUs && itemSKUs.length > 0 ? setData(itemSKUs) : setData([]);
    setLoading(false);
  }, [
    initUOMs,
    itemSKUs,
    initItemTypes,
    initItemSubTypes,
    initItemCategories,
    initItemSubCategories,
    isLoading,
    loading,
  ]);

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
          {userPerm && userPerm.perm_update_entities === "1" ? (
            <Button
              type="circle"
              style={{
                color: "white",
                background: "green",
              }}
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </Button>
          ) : null}
          {userPerm && userPerm.perm_delete_entities === "1" ? (
            <Popconfirm
              title="Are you sure to delete this item?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="circle"
                style={{
                  color: "white",
                  background: "green",
                }}
              >
                <DeleteOutlined />
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
      sorter: defaultColumnSorter("code"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "AccessCode",
      dataIndex: "accessCode",
      key: "accessCode",
      sorter: defaultColumnSorter("accessCode"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      sorter: defaultColumnSorter(""),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: defaultColumnSorter("description"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "CategoryId",
      dataIndex: "category_id",
      key: "category_id",
      sorter: defaultColumnSorter("category_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = itemCategories.filter(
          (item) => item.id === record.category_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "SubCategoryId",
      dataIndex: "subcategory_id",
      key: "subcategory_id",
      sorter: defaultColumnSorter("subcategory_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = itemSubCategories.filter(
          (item) => item.id === record.subcategory_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "TypeId",
      dataIndex: "type_id",
      key: "type_id",
      sorter: defaultColumnSorter("type_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = itemTypes.filter((item) => item.id === record.type_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "SubTypeId",
      dataIndex: "subtype_id",
      key: "subtype_id",
      sorter: defaultColumnSorter("subtype_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = itemSubTypes.filter((item) => item.id === record.subtype_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "NumDaysToExpire",
      dataIndex: "num_days_to_expire",
      key: "num_days_to_expire",
      sorter: numberColumnSorter("num_days_to_expire"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "NumDaysTriggerBeforeExpire",
      dataIndex: "num_days_trigger_before_expire",
      key: "num_days_trigger_before_expire",
      sorter: numberColumnSorter("num_days_trigger_before_expire"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "RestockingLevel",
      dataIndex: "restocking_level",
      key: "restocking_level",
      sorter: defaultColumnSorter("restocking_level"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "RestockingLevelUOMId",
      dataIndex: "restocking_level_uom_id",
      key: "restocking_level_uom_id",
      sorter: defaultColumnSorter("restocking_level_uom_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = UOMs.filter(
          (item) => item.id === record.restocking_level_uom_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "MiniumAcquisitionPrice",
      dataIndex: "minimum_acquisition_price",
      key: "minimum_acquisition_price",
      sorter: numberColumnSorter("minimum_acquisition_price"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "MiniumAcquisitionQty",
      dataIndex: "minimum_acquisition_qty",
      key: "minimum_acquisition_qty",
      sorter: numberColumnSorter("minimum_acquisition_qty"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "MiniumAcquisitionUomId",
      dataIndex: "minimum_acquisition_uom_id",
      key: "minimum_acquisition_uom_id",
      sorter: defaultColumnSorter("minimum_acquisition_uom_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = UOMs.filter(
          (item) => item.id === record.minimum_acquisition_uom_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "SellingDispositionPrice",
      dataIndex: "selling_disposition_price",
      key: "selling_disposition_price",
      sorter: numberColumnSorter("selling_disposition_price"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "SellingDispositionQty",
      dataIndex: "selling_disposition_qty",
      key: "selling_disposition_qty",
      sorter: numberColumnSorter("selling_disposition_qty"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "SellingDispositionUomId",
      dataIndex: "selling_disposition_uom_id",
      key: "selling_disposition_uom_id",
      sorter: defaultColumnSorter("selling_disposition_uom_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = UOMs.filter(
          (item) => item.id === record.selling_disposition_uom_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "SellingDispositionFixPrice",
      dataIndex: "selling_disposition_fix_price",
      key: "selling_disposition_fix_price",
      sorter: numberColumnSorter("selling_disposition_fix_price"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "CreatedDateTime",
      dataIndex: "created_datetime",
      key: "created_datetime",
      sorter: dateColumnSorter("created_datetime"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdCreatedBy",
      dataIndex: "person_id_createdby",
      key: "person_id_createdby",
      sorter: defaultColumnSorter("person_id_createdby"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = persons.filter(
          (item) => item.id === record.person_id_createdby
        );
        return res.length > 0 ? res[0].user_name : "";
      },
    },
    {
      title: "UpdatedDateTime",
      dataIndex: "updated_datetime",
      key: "updated_datetime",
      sorter: dateColumnSorter("updated_datetime"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      sorter: defaultColumnSorter("person_id_updatedby"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = persons.filter(
          (item) => item.id === record.person_id_updatedby
        );
        return res.length > 0 ? res[0].user_name : "";
      },
    },
  ];

  const processDataForExcel = () => {
    return data.map((record) => {
      const {
        status,
        category_id,
        subcategory_id,
        type_id,
        subtype_id,
        ...updatedRecord
      } = record;
      const selAccessCode = accessCodes.find(
        (item) => item.id === record.accessCode
      );
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);

      const selItemCategory = itemCategories.find(
        (item) => item.id === record.category_id
      );
      selItemCategory && (updatedRecord.category_id = selItemCategory.name);

      const selItemSubCategory = itemSubCategories.find(
        (item) => item.id === record.subcategory_id
      );
      selItemSubCategory &&
        (updatedRecord.subcategory_id = selItemSubCategory.name);

      let selType = itemTypes.find((item) => item.id === record.type_id);
      selType && (updatedRecord.type_id = selType.name);

      let selItemSubType = itemSubTypes.find(
        (item) => item.id === record.subtype_id
      );
      selItemSubType && (updatedRecord.subtype_id = selItemSubType.name);

      let selRestockinglevelUOM = UOMs.find(
        (item) => item.id === record.restocking_level_uom_id
      );
      selRestockinglevelUOM &&
        (updatedRecord.restocking_level_uom_id = selRestockinglevelUOM.name);

      let selMinimumAcquisitionUOM = UOMs.find(
        (item) => item.id === record.minimum_acquisition_uom_id
      );
      selMinimumAcquisitionUOM &&
        (updatedRecord.minimum_acquisition_uom_id =
          selMinimumAcquisitionUOM.name);

      let selSellingDispositionUOM = UOMs.find(
        (item) => item.id === record.selling_disposition_uom_id
      );
      selSellingDispositionUOM &&
        (updatedRecord.selling_disposition_uom_id =
          selSellingDispositionUOM.name);

      let selPersonCreatedBy = persons.find(
        (item) => item.id === record.person_id_createdby
      );
      selPersonCreatedBy &&
        (updatedRecord.person_id_createdby = selPersonCreatedBy.user_name);
      let selPersonUpdatedBy = persons.find(
        (item) => item.id === record.person_id_updatedby
      );
      selPersonUpdatedBy &&
        (updatedRecord.person_id_updatedby = selPersonUpdatedBy.user_name);
      return updatedRecord;
    });
  };

  return (
    <>
      {loading ? (
        <Spin />
      ) : (
        <div>
          <PageLayout
            title="ItemSKU"
            titleRightAction={() =>
              userPerm && userPerm.perm_create_entities === "1" ? (
                <Button
                  type="circle"
                  style={{
                    color: "white",
                    background: "green",
                  }}
                  onClick={handleCreate}
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
              onUpload={(options) => customRequest(options, tableName)}
              processDataForExcel={processDataForExcel}
              paperSize="A1"
            />
          </PageLayout>          
          <Modal title="Loading Data" open={visible} footer={null}>
            <Loading />
          </Modal>
        </div>
      )}
    </>
  );
};

export default ItemSKU;
