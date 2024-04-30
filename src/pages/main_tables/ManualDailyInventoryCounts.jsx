import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Select,
  Popconfirm,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  ManualDailyInventoryCountsUrl,
  CurrentItemInventoryUrl,
  BaseUrl,
} from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { relative } from "path";
import { useSelector } from "react-redux";
import { formItemLayout } from "../../../src/utils/data";

const { Search } = Input;
const { Option } = Select;
const ManualDailyInventoryCounts = () => {
  let persons = useSelector((state) => state.entities.persons);
  let uoms = useSelector((state) => state.settings.UOMs);
  let initItemSKUs = useSelector((state) => state.entities.itemSKUs);
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = ManualDailyInventoryCountsUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  const [data, setData] = useState([]);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [editId, setEditId] = useState(null);
  const [UOMs, setUOMs] = useState([]);
  const [itemSKUs, setItemSKUs] = useState([]);
  const [currentItemInventories, setCurrentItemInventories] = useState(null);

  //Search
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    let res;
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl +
        `api/ManualDailyInventoryCounts/` +
        `?timestamp=${timestamp}&search=${value}`;
      res = await search("get", SearchUrl, null, null);
    } else {
      res = await CRUD("get", ManualDailyInventoryCountsUrl, null, null);
    }
    setData(res);
  };
  //Sort Operation

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
        let result = await CRUD(
          "put",
          ManualDailyInventoryCountsUrl,
          values,
          editId
        );
        if (result) {
          let res = await CRUD(
            "get",
            ManualDailyInventoryCountsUrl,
            null,
            null
          );
          setData(res);
        }
        setUpgrade(true);
      } else {
        let result = await CRUD(
          "post",
          ManualDailyInventoryCountsUrl,
          values,
          null
        );
        if (result) {
          let res = await CRUD(
            "get",
            ManualDailyInventoryCountsUrl,
            null,
            null
          );
          setData(res);
        }
        setUpgrade(true);
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD(
      "delete",
      ManualDailyInventoryCountsUrl,
      record,
      record.id
    );
    if (result) {
      let res = await CRUD("get", ManualDailyInventoryCountsUrl, null, null);
      setData(res);
    }
    setUpgrade(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    setEditId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
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
      let res = await CRUD("get", ManualDailyInventoryCountsUrl, null, null);
      setData(res);
    }
    let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
    res === null
      ? setCurrentItemInventories([])
      : setCurrentItemInventories(res);
    uoms && uoms.length > 0 ? setUOMs(uoms) : setUOMs([]);
    initItemSKUs && initItemSKUs.length > 0
      ? setItemSKUs(initItemSKUs)
      : setItemSKUs([]);
    const response = await CRUD(
      "get",
      ManualDailyInventoryCountsUrl,
      null,
      null
    );
    response === null ? setData([]) : setData(response);
    setLoading(false);
  }, [isLoading, loading]);

  useEffect(() => {
    getItem();
    setUpgrade(false);
  }, [upgrade, getItem]);
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
          {userPerm && userPerm.perm_update_main === "1" ? (
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
          {userPerm && userPerm.perm_delete_main === "1" ? (
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
      render: (_, record, index) => {
        let res = currentItemInventories.filter(
          (item) => item.id === record.code
        );
        return res.length > 0 ? res[0].code : "";
      },
    },
    {
      title: "AccessCode",
      dataIndex: "accessCode",
      key: "accessCode",
      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "SkuId",
      dataIndex: "sku_id",
      key: "sku_id",
      render: (_, record, index) => {
        let res = itemSKUs.filter((item) => item.id === record.sku_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "UomId",
      dataIndex: "uom_id",
      key: "uom_id",
      render: (_, record, index) => {
        let res = UOMs.filter((item) => item.id === record.uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "QtyDay1",
      dataIndex: "qty_day_1",
      key: "qty_day_1",
    },
    {
      title: "QtyDay2",
      dataIndex: "qty_day_2",
      key: "qty_day_2",
    },
    {
      title: "QtyDay3",
      dataIndex: "qty_day_3",
      key: "qty_day_3",
    },
    {
      title: "QtyDay4",
      dataIndex: "qty_day_4",
      key: "qty_day_4",
    },
    {
      title: "QtyDay5",
      dataIndex: "qty_day_5",
      key: "qty_day_5",
    },
    {
      title: "QtyDay6",
      dataIndex: "qty_day_6",
      key: "qty_day_6",
    },
    {
      title: "QtyDay7",
      dataIndex: "qty_day_7",
      key: "qty_day_7",
    },
    {
      title: "QtyDay8",
      dataIndex: "qty_day_8",
      key: "qty_day_8",
    },
    {
      title: "QtyDay9",
      dataIndex: "qty_day_9",
      key: "qty_day_9",
    },
    {
      title: "QtyDay10",
      dataIndex: "qty_day_10",
      key: "qty_day_10",
    },
    {
      title: "QtyDay11",
      dataIndex: "qty_day_11",
      key: "qty_day_11",
    },
    {
      title: "QtyDay12",
      dataIndex: "qty_day_12",
      key: "qty_day_12",
    },
    {
      title: "QtyDay13",
      dataIndex: "qty_day_13",
      key: "qty_day_13",
    },
    {
      title: "QtyDay14",
      dataIndex: "qty_day_14",
      key: "qty_day_14",
    },
    {
      title: "QtyDay15",
      dataIndex: "qty_day_15",
      key: "qty_day_15",
    },
    {
      title: "QtyDay16",
      dataIndex: "qty_day_16",
      key: "qty_day_16",
    },
    {
      title: "QtyDay17",
      dataIndex: "qty_day_17",
      key: "qty_day_17",
    },
    {
      title: "QtyDay18",
      dataIndex: "qty_day_18",
      key: "qty_day_18",
    },
    {
      title: "QtyDay19",
      dataIndex: "qty_day_19",
      key: "qty_day_19",
    },
    {
      title: "QtyDay20",
      dataIndex: "qty_day_20",
      key: "qty_day_20",
    },
    {
      title: "QtyDay21",
      dataIndex: "qty_day_21",
      key: "qty_day_21",
    },
    {
      title: "QtyDay22",
      dataIndex: "qty_day_22",
      key: "qty_day_22",
    },
    {
      title: "QtyDay23",
      dataIndex: "qty_day_23",
      key: "qty_day_23",
    },
    {
      title: "QtyDay24",
      dataIndex: "qty_day_24",
      key: "qty_day_24",
    },
    {
      title: "QtyDay25",
      dataIndex: "qty_day_25",
      key: "qty_day_25",
    },
    {
      title: "QtyDay26",
      dataIndex: "qty_day_26",
      key: "qty_day_26",
    },
    {
      title: "QtyDay27",
      dataIndex: "qty_day_27",
      key: "qty_day_27",
    },
    {
      title: "QtyDay28",
      dataIndex: "qty_day_28",
      key: "qty_day_28",
    },
    {
      title: "QtyDay29",
      dataIndex: "qty_day_29",
      key: "qty_day_29",
    },
    {
      title: "QtyDay30",
      dataIndex: "qty_day_30",
      key: "qty_day_30",
    },
    {
      title: "DayPointer",
      dataIndex: "day_pointer",
      key: "day_pointer",
    },
    {
      title: "CreatedDateTime",
      dataIndex: "created_datetime",
      key: "created_datetime",
    },
    {
      title: "PersonIdCreatedBy",
      dataIndex: "person_id_createdby",
      key: "person_id_createdby",
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

      sorter: (a, b) =>
        new Date(a.updated_datetime) - new Date(b.updated_datetime),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      render: (_, record, index) => {
        let res = persons.filter(
          (item) => item.id === record.person_id_updatedby
        );
        return res.length > 0 ? res[0].user_name : "";
      },
    },
  ];

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          {userPerm && userPerm.perm_create_main === "1" ? (
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
            ManualDailyInventoryCounts
          </span>
          <div className="btn-ipt-group">
            <div className="btn-group">
              <div className="refresh-wrapper rightItem">
                <Button icon={<ReloadOutlined />} onClick={refresh}>
                  Refresh
                </Button>
              </div>
              <div className="upload-wrapper rightItem">
                <Upload
                  name="file"
                  accept=".csv,.xlsx"
                  customRequest={(options) => customRequest(options, tableName)}
                  multiple={false}
                >
                  <Button icon={<UploadOutlined />}>Upload (Max: 1)</Button>
                </Upload>
              </div>
            </div>
            <div className="search-wrapper rightItem">
              <label htmlFor="search-form">
                <Search
                  placeholder="What are you looking for?"
                  allowClear
                  onSearch={onSearch}
                  enterButton
                  style={{ width: "400px" }}
                />
              </label>
            </div>
          </div>
          <Table
            style={{ display: "flex", marginTop: "70px" }}
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
            title={editingItem ? "Edit Item" : "Add New Record"}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={handleOk}
          >
            <Form form={form} {...formItemLayout}>
              <Form.Item
                name="code"
                label="Code"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {currentItemInventories?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="accessCode"
                label="AccessCode"
                rules={[
                  {
                    required: false,
                    message: "Please select an access code",
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {accessCodes?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="sku_id"
                label="SkuId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {itemSKUs.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="uom_id"
                label="UomId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {UOMs.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="qty_day_1"
                label="QtyDay1"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_2"
                label="QtyDay2"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_3"
                label="QtyDay3"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_4"
                label="QtyDay4"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_5"
                label="QtyDay5"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_6"
                label="QtyDay6"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_7"
                label="QtyDay7"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_8"
                label="QtyDay8"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_9"
                label="QtyDay9"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_10"
                label="QtyDay10"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_11"
                label="QtyDay11"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_12"
                label="QtyDay12"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_13"
                label="QtyDay13"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_14"
                label="QtyDay14"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_15"
                label="QtyDay15"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_16"
                label="QtyDay16"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_17"
                label="QtyDay17"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_18"
                label="QtyDay18"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_19"
                label="QtyDay19"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_20"
                label="QtyDay20"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_21"
                label="QtyDay21"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_22"
                label="QtyDay22"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_23"
                label="QtyDay23"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_24"
                label="QtyDay24"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_25"
                label="QtyDay25"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_26"
                label="QtyDay26"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_27"
                label="QtyDay27"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_28"
                label="QtyDay28"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_29"
                label="QtyDay29"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="qty_day_30"
                label="QtyDay30"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="day_pointer"
                label="DayPointer"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default ManualDailyInventoryCounts;
