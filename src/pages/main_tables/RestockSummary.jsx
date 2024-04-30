import { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Select,
  Popconfirm,
  DatePicker,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CheckOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { RestockSummaryUrl, BaseUrl } from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { relative } from "path";
import { useSelector } from "react-redux";
import moment from "moment";
import { formItemLayout } from "../../../src/utils/data";

const { Search } = Input;
const { Option } = Select;
const RestockSummary = () => {
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = RestockSummaryUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let countries = useSelector((state) => state.settings.countries);
  let regions = useSelector((state) => state.settings.regions);
  let branches = useSelector((state) => state.settings.branches);
  let warehouses = useSelector((state) => state.settings.warehouses);
  let zones = useSelector((state) => state.settings.zones);
  let areas = useSelector((state) => state.settings.areas);
  let rooms = useSelector((state) => state.settings.rooms);
  let persons = useSelector((state) => state.entities.persons);
  let currencies = useSelector((state) => state.settings.currencies);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let status = useSelector((state) => state.settings.status);

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

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
      let changedValues = {
        ...values,
        issued_datetime: values.issued_datetime.format("YYYY-MM-DDThh:mm"),
        approved_datetime: values.approved_datetime.format("YYYY-MM-DDThh:mm"),
      };
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD(
          "put",
          RestockSummaryUrl,
          changedValues,
          editId
        );
        if (result) {
          let res = await CRUD("get", RestockSummaryUrl, null, null);
          setData(res);
        }
      } else {
        let result = await CRUD("post", RestockSummaryUrl, changedValues, null);
        if (result) {
          let res = await CRUD("get", RestockSummaryUrl, null, null);
          setData(res);
        }
      }
    });
  };

  //Search
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl + `api/RestockSummary/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      setData(res);
    } else {
      let res = await CRUD("get", RestockSummaryUrl, null, null);
      setData(res);
    }
  };

  const handleDelete = async (record) => {
    let result = await CRUD("delete", RestockSummaryUrl, record, record.id);
    if (result) {
      let res = await CRUD("get", RestockSummaryUrl, null, null);
      setData(res);
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    setEditId(record.id);
    let changedValues = {
      ...record,
      issued_datetime: moment(record.issued_datetime),
      approved_datetime: moment(record.approved_datetime),
    };
    form.setFieldsValue(changedValues);
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
      let res = await CRUD("get", RestockSummaryUrl, null, null);
      setData(res);
    }
    const response = await CRUD("get", RestockSummaryUrl, null, null);
    response === null ? setData([]) : setData(response);
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
          {userPerm &&
          userPerm.perm_update_main === "1" &&
          userPerm.perm_update_restock === "1" ? (
            <Button
              type="circle"
              style={{
                color: "white",
                background: "green",
              }}
              onClick={() => handleEdit(record)}
            >
              <CheckOutlined />
            </Button>
          ) : null}
          {userPerm &&
          userPerm.perm_update_main === "1" &&
          userPerm.perm_update_restock === "1" ? (
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
          {userPerm &&
          userPerm.perm_delete_main === "1" &&
          userPerm.perm_delete_restock === "1" ? (
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
      title: "RestockId",
      dataIndex: "restock_id",
      key: "restock_id",
    },
    {
      title: "IssuedDateTime",
      dataIndex: "issued_datetime",
      key: "issued_datetime",
    },
    {
      title: "PersonIdIssuedby",
      dataIndex: "person_id_issuedby",
      key: "person_id_issuedby",
      render: (_, record, index) => {
        let r1 = persons?.filter(
          (item) => item.id === record.person_id_issuedby
        );
        return r1.length > 0 ? r1[0].user_name : "";
      },
    },
    {
      title: "ApprovedDateTime",
      dataIndex: "approved_datetime",
      key: "approved_datetime",
    },
    {
      title: "PersonIdApprovedby",
      dataIndex: "person_id_approvedby",
      key: "person_id_approvedby",
      render: (_, record, index) => {
        let r1 = persons?.filter(
          (item) => item.id === record.person_id_approvedby
        );
        return r1.length > 0 ? r1[0].user_name : "";
      },
    },
    {
      title: "CountryId",
      dataIndex: "country_id",
      key: "country_id",
      render: (_, record, index) => {
        let r1 = countries?.filter((item) => item.id === record.country_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "RegionId",
      dataIndex: "region_id",
      key: "region_id",
      render: (_, record, index) => {
        let r1 = regions?.filter((item) => item.id === record.region_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "BranchId",
      dataIndex: "branch_id",
      key: "branch_id",
      render: (_, record, index) => {
        let r1 = branches?.filter((item) => item.id === record.branch_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "WarehouseId",
      dataIndex: "warehouse_id",
      key: "warehouse_id",
      render: (_, record, index) => {
        let r1 = warehouses?.filter((item) => item.id === record.warehouse_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "ZoneId",
      dataIndex: "zone_id",
      key: "zone_id",
      render: (_, record, index) => {
        let r1 = zones?.filter((item) => item.id === record.zone_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "AreaId",
      dataIndex: "area_id",
      key: "area_id",
      render: (_, record, index) => {
        let r1 = areas?.filter((item) => item.id === record.area_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "RoomId",
      dataIndex: "room_id",
      key: "room_id",
      render: (_, record, index) => {
        let res = rooms?.filter((item) => item.id === record.zone_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "CurrencyId",
      dataIndex: "currency_id",
      key: "currency_id",
      render: (_, record, index) => {
        let r1 = currencies?.filter((item) => item.id === record.currency_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "TotalPrice",
      dataIndex: "total_price",
      key: "total_price",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record, index) => {
        let res = status?.filter((item) => item.id === record.status);
        return res.length > 0 ? res[0].name : "";
      },
    },
  ];

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
            RestockSummary
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
            title={editingItem ? "Edit Item" : "Add New Record"}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={handleOk}
          >
            <Form form={form} {...formItemLayout}>
              <Form.Item
                name="restock_id"
                label="RestockId"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="issued_datetime"
                label="IssuedDateTime"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker showTime />
              </Form.Item>
              <Form.Item
                name="person_id_issuedby"
                label="PersonIdIssuedby"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {persons?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.user_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="approved_datetime"
                label="ApprovedDateTime"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker showTime />
              </Form.Item>
              <Form.Item
                name="person_id_approvedby"
                label="PersonIdApprovedby"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {persons?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.user_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="country_id"
                label="CountryId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {countries?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="region_id"
                label="RegionId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {regions?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="branch_id"
                label="BranchId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {branches?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="warehouse_id"
                label="WarehouseId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {warehouses?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="zone_id"
                label="ZoneId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {zones?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="area_id"
                label="AreaId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {areas?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="room_id"
                label="RoomId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {rooms?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="total_price"
                label="TotalPrice"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="currency_id"
                label="CurrencyId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {currencies?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default RestockSummary;
