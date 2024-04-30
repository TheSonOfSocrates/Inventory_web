import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Popconfirm,
  InputNumber,
  Switch,
  Upload,
  Select,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  SettingsRolesAndPermissionsUrl,
  BaseUrl,
} from "../../../../utils/network";
import { CRUD, search, customRequest } from "../../../../utils/js_functions";
import Loading from "../../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getRolesAndPermissions } from "../../../../redux/slice";
import { formItemLayout } from "../../../../utils/data";
import GeneralTable from "../../../../components/generalTable/GeneralTable";
import PageLayout from "../../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../../components/generalTable/GeneralTableHelper";

import { relative } from "path";

const { Search } = Input;
const { Option } = Select;

const SettingsRolesAndPermissions = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = SettingsRolesAndPermissionsUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();
  
  let persons = useSelector((state) => state.entities.persons);
  let rolesAndPermissions = useSelector(
    (state) => state.settings.rolesAndPermissions
  );

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
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
        `api/SettingsRolesAndPermissions/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getRolesAndPermissions(res));
    } else {
      let res = await CRUD("get", SettingsRolesAndPermissionsUrl, null, null);
      dispatch(getRolesAndPermissions(res));
    }
  };

  const showModal = () => {
    form.resetFields();

    setIsModalVisible(true);
  };
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD(
          "put",
          SettingsRolesAndPermissionsUrl,
          values,
          editId
        );

        if (result) {
          let res = await CRUD(
            "get",
            SettingsRolesAndPermissionsUrl,
            null,
            null
          );
          dispatch(getRolesAndPermissions(res));
        }
      } else {
        let result = await CRUD(
          "post",
          SettingsRolesAndPermissionsUrl,
          values,
          null
        );
        if (result) {
          let res = await CRUD(
            "get",
            SettingsRolesAndPermissionsUrl,
            null,
            null
          );
          dispatch(getRolesAndPermissions(res));
        }
      }
    });
  };

  
  const handleDelete = async (record) => {
    let result = await CRUD(
      "delete",
      SettingsRolesAndPermissionsUrl,
      record,
      record.id
    );

    if (result) {
      let res = await CRUD("get", SettingsRolesAndPermissionsUrl, null, null);
      dispatch(getRolesAndPermissions(res));
    }
  };

  const handleCreate = () => {
    history.push("/create_settings_roles_and_permissions");
  };

  const handleEdit = (record) => {
    history.push({
      pathname: "/create_settings_roles_and_permissions",
      state: { updatingRoleAndPermissions: record },
    });
    return;

    form.resetFields();
    for (const key in record) {
      if (record.hasOwnProperty(key)) {
        if (record[key] === null) {
          record[key] = 0;
        }
      }
    }

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
      let res = await CRUD("get", SettingsRolesAndPermissionsUrl, null, null);
      dispatch(getRolesAndPermissions(res));
    }
    rolesAndPermissions && rolesAndPermissions.length > 0
      ? setData(rolesAndPermissions)
      : setData([]);
    setLoading(false);
  }, [rolesAndPermissions, isLoading, loading]);

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
          {userPerm && userPerm.perm_update_settings === "1" ? (
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
          {userPerm && userPerm.perm_delete_settings === "1" ? (
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
      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "PermCreateRestock",
      dataIndex: "perm_manage_restock",
      key: "perm_manage_restock",
      render: (_, record) =>
        record.perm_manage_restock === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermCreateRestock",
      dataIndex: "perm_create_restock",
      key: "perm_create_restock",
      render: (_, record) =>
        record.perm_create_restock === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermCreateUtilities",
      dataIndex: "perm_create_utilities",
      key: "perm_create_utilities",
      render: (_, record) =>
        record.perm_create_utilities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermCreateMain",
      dataIndex: "perm_create_main",
      key: "perm_create_main",
      render: (_, record) =>
        record.perm_create_main === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermCreateEntities",
      dataIndex: "perm_create_entities",
      key: "perm_create_entities",
      render: (_, record) =>
        record.perm_create_entities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermCreateSettings",
      dataIndex: "perm_create_settings",
      key: "perm_create_settings",
      render: (_, record) =>
        record.perm_create_settings === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermCreateLocation",
      dataIndex: "perm_create_location",
      key: "perm_create_location",
      render: (_, record) =>
        record.perm_create_location === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermReadRestock",
      dataIndex: "perm_read_restock",
      key: "perm_read_restock",
      render: (_, record) =>
        record.perm_read_restock === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermReadUtilities",
      dataIndex: "perm_read_utilities",
      key: "perm_read_utilities",
      render: (_, record) =>
        record.perm_read_utilities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermReadMain",
      dataIndex: "perm_read_main",
      key: "perm_read_main",
      render: (_, record) =>
        record.perm_read_main === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermReadEntities",
      dataIndex: "perm_read_entities",
      key: "perm_read_entities",
      render: (_, record) =>
        record.perm_read_entities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermReadSettings",
      dataIndex: "perm_read_settings",
      key: "perm_read_settings",
      render: (_, record) =>
        record.perm_read_settings === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermReadLocation",
      dataIndex: "perm_read_location",
      key: "perm_read_location",
      render: (_, record) =>
        record.perm_read_location === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermUpdateRestock",
      dataIndex: "perm_update_restock",
      key: "perm_update_restock",
      render: (_, record) =>
        record.perm_update_restock === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermUpdateUtilities",
      dataIndex: "perm_update_utilities",
      key: "perm_update_utilities",
      render: (_, record) =>
        record.perm_update_utilities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermUpdateMain",
      dataIndex: "perm_update_main",
      key: "perm_update_main",
      render: (_, record) =>
        record.perm_update_main === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermUpdateEntities",
      dataIndex: "perm_update_entities",
      key: "perm_update_entities",
      render: (_, record) =>
        record.perm_update_entities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermUpdateSettings",
      dataIndex: "perm_update_settings",
      key: "perm_update_settings",
      render: (_, record) =>
        record.perm_update_settings === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermUpdateLocation",
      dataIndex: "perm_update_location",
      key: "perm_update_location",
      render: (_, record) =>
        record.perm_update_location === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermDeleteRestock",
      dataIndex: "perm_delete_restock",
      key: "perm_delete_restock",
      render: (_, record) =>
        record.perm_delete_restock === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermDeleteUtilities",
      dataIndex: "perm_delete_utilities",
      key: "perm_delete_utilities",
      render: (_, record) =>
        record.perm_delete_utilities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermDeleteMain",
      dataIndex: "perm_delete_main",
      key: "perm_delete_main",
      render: (_, record) =>
        record.perm_delete_main === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermDeleteEntities",
      dataIndex: "perm_delete_entities",
      key: "perm_delete_entities",
      render: (_, record) =>
        record.perm_delete_entities === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermDeleteSettings",
      dataIndex: "perm_delete_settings",
      key: "perm_delete_settings",
      render: (_, record) =>
        record.perm_delete_settings === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "PermDeleteLocation",
      dataIndex: "perm_delete_location",
      key: "perm_delete_location",
      render: (_, record) =>
        record.perm_delete_location === "1" ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <MinusOutlined style={{ color: "red" }} />
        ),
    },
  ];

  const processDataForExcel = () => {
    return data.map((record) => {
      const { status, ...updatedRecord } = record;
      const selAccessCode = accessCodes.find(
        (item) => item.id === record.accessCode
      );
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);

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

  }

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="SettingsRolesAndPermissions"
            titleRightAction={() => 
              userPerm && userPerm.perm_create_settings === "1" ? (
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
            <Form
              initialValues={{
                perm_manage_restock: 0,
                perm_create_restock: 0,
                perm_create_utilities: 0,
                perm_create_main: 0,
                perm_create_entities: 0,
                perm_create_settings: 0,
                perm_create_location: 0,

                perm_read_restock: 0,
                perm_read_utilities: 0,
                perm_read_main: 0,
                perm_read_entities: 0,
                perm_read_settings: 0,
                perm_read_location: 0,

                perm_update_restock: 0,
                perm_update_utilities: 0,
                perm_update_main: 0,
                perm_update_entities: 0,
                perm_update_settings: 0,
                perm_update_location: 0,

                perm_delete_restock: 0,
                perm_delete_utilities: 0,
                perm_delete_main: 0,
                perm_delete_entities: 0,
                perm_delete_settings: 0,
                perm_delete_location: 0,
              }}
              form={form}
              {...formItemLayout}
            >
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
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="perm_manage_restock"
                label="PermManageRestock"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_create_restock"
                label="PermCreateRestock"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_create_utilities"
                label="PermCreateUtilities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_create_main"
                label="PermCreateMain"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_create_entities"
                label="PermCreateEntities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_create_settings"
                label="PermCreateSettings"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_create_location"
                label="PermCreateLocation"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_read_restock"
                label="PermReadRestock"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_read_utilities"
                label="PermReadUtilities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_read_main"
                label="PermReadMain"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_read_entities"
                label="PermReadEntities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_read_settings"
                label="PermReadSettings"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_read_location"
                label="PermReadLocation"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_update_restock"
                label="PermUpdateRestock"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_update_utilities"
                label="PermUpdateUtilities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_update_main"
                label="PermUpdateMain"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_update_entities"
                label="PermUpdateEntities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_update_settings"
                label="PermUpdateSettings"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_update_location"
                label="PermUpdateLocation"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_delete_restock"
                label="PermDeleteRestock"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_delete_utilities"
                label="PermDeleteUtilities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_delete_main"
                label="PermDeleteMain"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_delete_entities"
                label="PermDeleteEntities"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_delete_settings"
                label="PermDeleteSettings"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
              <Form.Item
                name="perm_delete_location"
                label="PermDeleteLocation"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  placeholder={"0 OR 1"}
                  min={0}
                  max={1}
                  defaultValue={0}
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default SettingsRolesAndPermissions;
