import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Popconfirm,
  Upload,
  Select,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { EntityVehicleUrl, BaseUrl } from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getVehicles } from "../../redux/slice";
import { formItemLayout } from "../../../src/utils/data";
import GeneralTable from "../../components/generalTable/GeneralTable";
import PageLayout from "../../components/PageLayout";
import { defaultColumnSorter, numberColumnSorter, dateColumnSorter } from "../../components/generalTable/GeneralTableHelper";

import { relative } from "path";

const { Search } = Input;
const { Option } = Select;
const Vehicle = () => {
  const dispatch = useDispatch();
  let persons = useSelector((state) => state.entities.persons);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = EntityVehicleUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let vehicles = useSelector((state) => state.entities.vehicles);

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);

  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl + `api/EntityVehicle/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getVehicles(res));
    } else {
      let res = await CRUD("get", EntityVehicleUrl, null, null);
      dispatch(getVehicles(res));
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
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD("put", EntityVehicleUrl, values, editId);
        if (result) {
          let res = await CRUD("get", EntityVehicleUrl, null, null);
          dispatch(getVehicles(res));
        }
      } else {
        let result = await CRUD("post", EntityVehicleUrl, values, null);
        if (result) {
          let res = await CRUD("get", EntityVehicleUrl, null, null);
          dispatch(getVehicles(res));
        }
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD("delete", EntityVehicleUrl, record, record.id);
    if (result) {
      let res = await CRUD("get", EntityVehicleUrl, null, null);
      dispatch(getVehicles(res));
    }
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
      let res = await CRUD("get", EntityVehicleUrl, null, null);
      dispatch(getVehicles(res));
    }
    vehicles && vehicles.length > 0 ? setData(vehicles) : setData([]);
    setLoading(false);
  }, [vehicles, isLoading, loading]);

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
      title: "Make",
      dataIndex: "make",
      key: "make",
      sorter: defaultColumnSorter("make"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PlateNumber",
      dataIndex: "plate_number",
      key: "plate_number",
      sorter: defaultColumnSorter("plate_number"),
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
      sorter: dateColumnSorter("person_id_createdby"),
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
      sorter: dateColumnSorter("updated_datetime"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      sorter: dateColumnSorter("person_id_updatedby"),
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
      const {status, category_id, subcategory_id, type_id, subtype_id, ...updatedRecord} = record;
      const selAccessCode = accessCodes.find((item) => item.id === record.accessCode);
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);      
      let selPersonCreatedBy = persons.find(
        (item) => item.id === record.person_id_createdby
      );
      selPersonCreatedBy && (updatedRecord.person_id_createdby = selPersonCreatedBy.user_name)
      let selPersonUpdatedBy = persons.find(
        (item) => item.id === record.person_id_updatedby
      );
      selPersonUpdatedBy && (updatedRecord.person_id_updatedby = selPersonUpdatedBy.user_name)
      return updatedRecord;
    })
  }

  return (
    <>
      {loading ? (
        <Spin />
      ) : (
        <div>
          <PageLayout
            title="Vehicle"
            titleRightAction = {() =>             
              userPerm && userPerm.perm_create_entities === "1" ? (
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
              processDataForExcel = {processDataForExcel}
              paperSize = "A1"
            />
          </PageLayout>          
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
                <Input />
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
                name="make"
                label="Make"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="plate_number"
                label="PlateNumber"
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

export default Vehicle;
