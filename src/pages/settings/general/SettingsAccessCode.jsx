import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Select,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { SettingsAccessCodeUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getAccessCodes } from "../../../redux/slice";
import { formItemLayout } from "../../../utils/data";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const { Search } = Input;
const { Option } = Select;
const SettingsLocationBay = () => {
  const dispatch = useDispatch();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);

  let tableName = SettingsAccessCodeUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  //Search
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl +
        `api/SettingsAccessCode/` +
        `?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getAccessCodes(res));
    } else {
      let res = await CRUD("get", SettingsAccessCodeUrl, null, null);
      dispatch(getAccessCodes(res));
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD("put", SettingsAccessCodeUrl, values, editId);
        if (result) {
          let res = await CRUD("get", SettingsAccessCodeUrl, null, null);
          dispatch(getAccessCodes(res));
        }
      } else {
        let result = await CRUD("post", SettingsAccessCodeUrl, values, null);
        if (result) {
          let res = await CRUD("get", SettingsAccessCodeUrl, null, null);
          dispatch(getAccessCodes(res));
        }
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD("delete", SettingsAccessCodeUrl, null, record.id);
    if (result) {
      let res = await CRUD("get", SettingsAccessCodeUrl, null, null);
      dispatch(getAccessCodes(res));
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
      let res = await CRUD("get", SettingsAccessCodeUrl, null, null);
      dispatch(getAccessCodes(res));
    }
    accessCodes && accessCodes.length > 0 ? setData(accessCodes) : setData([]);
    setLoading(false);
  }, [accessCodes, isLoading, loading]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <div>
          {userPerm &&
          userPerm.perm_update_settings === "1" &&
          userPerm.perm_update_location === "1" ? (
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
          userPerm.perm_delete_settings === "1" &&
          userPerm.perm_delete_location === "1" ? (
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
      sorter: defaultColumnSorter('code'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
    },
  ];

  const processDataForExcel = () => {
    return data.map(record => {
      const {status, syncDateTime, ...updatedRecord} = record;
      return updatedRecord;
    })
  };

  return (
    <div>
      <PageLayout
        title="SettingsAccessCode"
        titleRightAction={() =>
          userPerm &&
          userPerm.perm_create_settings === "1" &&
          userPerm.perm_create_location === "1" ? (
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
          paperSize="A1"
        />
      </PageLayout>
      {userPerm &&
      userPerm.perm_create_settings === "1" &&
      userPerm.perm_create_location === "1" ? (
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
            name="name"
            label="Name"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsLocationBay;
