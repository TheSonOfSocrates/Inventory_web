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
  DatePicker,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { OutboundRegistrationUrl, BaseUrl } from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { relative } from "path";
import { useSelector } from "react-redux";
import moment from "moment";
import { formItemLayout } from "../../../src/utils/data";
import GeneralTable from "../../components/generalTable/GeneralTable";
import PageLayout from "../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../components/generalTable/GeneralTableHelper";

const { Search } = Input;
const { Option } = Select;
const OutboundRegistration = () => {
  let persons = useSelector((state) => state.entities.persons);
  let vehicles = useSelector((state) => state.entities.vehicles);
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = OutboundRegistrationUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let userPerm = JSON.parse(localStorage.getItem("userPerm"));

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [editId, setEditId] = useState(null);

  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl +
        `api/OutboundRegistration/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      setData(res);
    } else {
      let res = await CRUD("get", OutboundRegistrationUrl, null, null);
      setData(res);
    }
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
      let changedValues = {
        ...values,
        datetime_out: values.datetime_out.format("YYYY-MM-DDThh:mm"),
      };
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD(
          "put",
          OutboundRegistrationUrl,
          changedValues,
          editId
        );
        if (result) {
          let res = await CRUD("get", OutboundRegistrationUrl, null, null);
          setData(res);
        }
        setUpgrade(true);
      } else {
        let result = await CRUD(
          "post",
          OutboundRegistrationUrl,
          changedValues,
          null
        );
        if (result) {
          let res = await CRUD("get", OutboundRegistrationUrl, null, null);
          setData(res);
        }
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD(
      "delete",
      OutboundRegistrationUrl,
      record,
      record.id
    );
    if (result) {
      let res = await CRUD("get", OutboundRegistrationUrl, null, null);
      setData(res);
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    setEditId(record.id);
    let changedValues = {
      ...record,
      datetime_out: moment(record.datetime_out),
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
      let res = await CRUD("get", OutboundRegistrationUrl, null, null);
      setData(res);
    }
    const response = await CRUD("get", OutboundRegistrationUrl, null, null);
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
      title: "DriverId",
      dataIndex: "driver_id",
      key: "driver_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("driver_id"),
      render: (_, record, index) => {
        let u = persons?.filter((item) => item.id === record.driver_id);
        return u.length > 0 ? u[0].user_name : "";
      },
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
      title: "VehicleId",
      dataIndex: "vehicle_id",
      key: "vehicle_id",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("vehicle_id"),
      render: (_, record, index) => {
        let u = vehicles?.filter((item) => item.id === record.vehicle_id);
        return u.length > 0 ? u[0].code : "";
      },
    },
    {
      title: "DateTimeOut",
      dataIndex: "datetime_out",
      key: "datetime_out",
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("datetime_out"),
    },
    {
      title: "CreatedDateTime",
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
      sorter: defaultColumnSorter("person_id_createdby"),
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
      sortDirections: ["descend", "ascend"],
      sorter: dateColumnSorter("updated_datetime"),
      sorter: (a, b) =>
        new Date(a.updated_datetime) - new Date(b.updated_datetime),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("person_id_updatedby"),
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
      const { status, ...updatedRecord } = record;
      const selAccessCode = accessCodes.find(
        (item) => item.id === record.accessCode
      );
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);
      
      let selDriver = persons?.find((item) => item.id === record.driver_id);
      selDriver && (updatedRecord.driver_id = selDriver.user_name)
  
      let selVehicle = vehicles?.filter((item) => item.id === record.vehicle_id);
      selVehicle && (updatedRecord.vehicle_id = selVehicle.code)
  
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
    })
  }

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="Outbound Registration"
            titleRightAction={() =>
              userPerm && userPerm.perm_create_main === "1" ? (
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
              paperSize="A4"
            />
          </PageLayout>
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
                name="driver_id"
                label="DriverId"
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
                name="vehicle_id"
                label="VehicleId"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {vehicles?.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="datetime_out"
                label="DateTimeOut"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <DatePicker showTime />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default OutboundRegistration;
