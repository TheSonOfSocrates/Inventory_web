import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Select,
  Popconfirm,
  InputNumber,
  Typography,
  Upload
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined
} from "@ant-design/icons";
import {
  CurrentItemInventoryUrl,
  RestockItemsUrl,
  RestockSummaryUrl,
  BaseUrl,
} from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { relative } from "path";
import { useSelector } from "react-redux";
import { formItemLayout } from "../../utils/data";
import { Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import RestockDetail from "../../utils/restock_detail_modal";
import { MyContextProvider, MyContext } from "../../utils/context";



const { Search } = Input;
const { Option } = Select;
const RestockItems = () => {
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);

  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let UOMs = useSelector((state) => state.settings.UOMs);
  let currencies = useSelector((state) => state.settings.currencies);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let persons = useSelector((state) => state.entities.persons);

  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.id === editingKey;

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [restockSummaries, setRestockSummaries] = useState(null);
  const [currentItemInventories, setCurrentItemInventories] = useState(null);
  const [selectedData, setSelectedData] = useState([]);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedData(selectedRows);

      console.log("selectedRows: ", selectedRows);
    },
  };

  //Modal Open
  const showModal = () => {
    setIsModalVisible(true);
  };
  // CRUD Operation
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD("put", RestockItemsUrl, values, editId);
        if (result) {
          let res = await CRUD("get", RestockItemsUrl, null, null);
          setData(res);
        }
      } else {
        // let result = await CRUD("post", CurrentItemInventoryUrl, values, null);
        // if (result) {
        let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
        setData(res);
        // }
      }
    });
  };

  //Search bar
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl + `api/RestockItems/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      setData(res);
    } else {
      let res = await CRUD("get", RestockItemsUrl, null, null);
      setData(res);
    }
  };
  const handleDelete = async (id) => {
    let updatedData = selectedData.filter((item) => item.id !== id);
    setSelectedData(updatedData);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    setEditId(record.id);
    form.setFieldsValue(record);
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
      let res = await CRUD("get", RestockItemsUrl, null, null);
      setData(res);
    }
    let initItems = await CRUD("get", CurrentItemInventoryUrl, null, null);
    initItems === null
      ? setCurrentItemInventories([])
      : setCurrentItemInventories(initItems);

    let initRestockSummaries = await CRUD("get", RestockSummaryUrl, null, null);
    initRestockSummaries === null
      ? setRestockSummaries([])
      : setRestockSummaries(initRestockSummaries);

    initItems === null ? setData([]) : setData(initItems);
    setLoading(false);
  }, [isLoading, loading]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  let columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "ItemSKU",
      dataIndex: "sku_id",
      key: "sku_id",
      render: (_, record, index) => {
        let res = itemSKUs?.filter((item) => item.id === record.sku_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Current Qty(regular)",
      dataIndex: "regular_net_qty_remaining",
      key: "regular_net_qty_remaining",
    },
    {
      title: "Current Qty(eaches)",
      dataIndex: "eaches_net_qty_remaining",
      key: "eaches_net_qty_remaining",
    },
    {
      title: "UOM(regular)",
      dataIndex: "regular_uom_id",
      key: "regular_uom_id",
      render: (_, record, index) => {
        let res = UOMs?.filter((item) => item.id === record.regular_uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "UOM(eaches)",
      dataIndex: "eaches_remaining_uom_id",
      key: "eaches_remaining_uom_id",
      render: (_, record, index) => {
        let res = UOMs?.filter((item) => item.id === record.regular_uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Restocking Level",
      dataIndex: "restocking_level",
      key: "restocking_level",
      render: (_, record, index) => {
        let res = itemSKUs?.filter((item) => item.id === record.item_sku_id);
        return res.length > 0 ? res[0].restocking_level : "";
      },
    },
    {
      title: "Quantity To Restock",
      dataIndex: "restock_qty",
      key: "restock_qty",
    },
    {
      title: "Restocking UOM",
      dataIndex: "min_acq_currency_id",
      key: "min_acq_currency_id",
      render: (_, record, index) => {
        let res = currencies?.filter((item) => item.id === record.item_sku_id);
        return res.length > 0 ? res[0].restocking_level_uom_id : "";
      },
    },
  ];

  // let actionColumn = {
  //   title: "operation",
  //   dataIndex: "operation",
  //   render: (_, record) => {
  //     const editable = isEditing(record);
  //     return editable ? (
  //       <span>
  //         <Typography.Link
  //           onClick={() => save(record.key)}
  //           style={{
  //             marginRight: 8,
  //           }}
  //         >
  //           Save
  //         </Typography.Link>
  //         <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
  //           <a>Cancel</a>
  //         </Popconfirm>
  //       </span>

  //       <Typography.Link
  //         disabled={editingKey !== ""}
  //         onClick={() => edit(record)}
  //       >
  //         Edit
  //       </Typography.Link>
  //     );
  //   },
  // };

  let updatedColumns = [...columns];
  // updatedColumns.splice(1, 0, actionColumn);

  // const mergedColumns = updatedColumns.map((col) => {
  //   if (!col.editable) {
  //     return col;
  //   }
  //   return {
  //     ...col,
  //     onCell: (record) => ({
  //       record,
  //       inputType: col.dataIndex === "restocking_level" ? "number" : "text",
  //       dataIndex: col.dataIndex,
  //       title: col.title,
  //       editing: isEditing(record),
  //     }),
  //   };
  // });

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          {userPerm &&
          userPerm.perm_create_main === "1" &&
          userPerm.perm_create_restock === "1" ? (
            <Button
              type="circle"
              style={{
                color: "white",
                background: "green",
              }}
              onClick={showModal}
            >
              <PlusOutlined style={{ size: 20 }} />
            </Button>
          ) : null}
          <span style={{ margin: "0 8px" }} />
          <span
            style={{
              color: "green",
              fontSize: 20,
              fontFamily: "cursive",
            }}
          >
            RestockItem
          </span>
          <div className="btn-ipt-group">
            <div className="btn-group">
          <div className="refresh-wrapper rightItem">
            <Button icon={<ReloadOutlined />} onClick={refresh}>
              Refresh
            </Button>
          </div>
          </div>
          <div className="search-wrapper rightItem">
            <label htmlFor="search-form">
              <Search
                placeholder="What are you looking for?"
                allowClear
                onSearch={onSearch}
                enterButton
                  style={{width: "400px"}}
                  
              />
            </label>
          </div>
          </div>
          <Table
            rowSelection={rowSelection}
            style={{ marginTop: "70px" }}
            dataSource={data.map((item, index) => ({
              ...item,
              key: index,
            }))}
            columns={columns}
            pagination={{
              position: ["bottomLeft"],
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: true,
              onShowSizeChange: (current, size) => setPageSize(size),
            }}
          />
          {/* Modal for Add/Edit */}
          <Modal title="Loading Data" open={visible} footer={null}>
            <Loading />
          </Modal>
          <Modal
            open={isModalVisible}
            title={"Restock Details"}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={handleOk}
            width={800}
          >
            <div style={{ maxWidth: "100%", overflowX: "auto" }}>
              <RestockDetail originData={selectedData} />
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default RestockItems;
