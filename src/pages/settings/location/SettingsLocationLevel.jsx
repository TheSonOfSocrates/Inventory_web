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
import { SettingsLocationLevelUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getLevels } from "../../../redux/slice";
import { formItemLayout } from "../../../../src/utils/data";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
	defaultColumnSorter,
	numberColumnSorter,
	dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";
import { relative } from "path";

const { Search } = Input;
const { Option } = Select;
const SettingsLocationLevel = () => {
  const dispatch = useDispatch();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = SettingsLocationLevelUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let levels = useSelector((state) => state.settings.levels);
  let initReports = useSelector((state) => state.settings.reports);
  let uoms = useSelector((state) => state.settings.UOMs);
  let initTypes = useSelector((state) => state.settings.levelTypes);
  let initParentLocations = useSelector((state) => state.settings.bays);
  let persons = useSelector((state) => state.entities.persons);
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [reports, setReports] = useState([]);
  const [parentLocations, setParentLocations] = useState([]);
  const [UOMs, setUOMs] = useState([]);
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
        `api/SettingsLocationLevel/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getLevels(res));
    } else {
      let res = await CRUD("get", SettingsLocationLevelUrl, null, null);
      dispatch(getLevels(res));
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
        let result = await CRUD(
          "put",
          SettingsLocationLevelUrl,
          values,
          editId
        );
        if (result) {
          let res = await CRUD("get", SettingsLocationLevelUrl, null, null);
          dispatch(getLevels(res));
        }
      } else {
        let result = await CRUD("post", SettingsLocationLevelUrl, values, null);
        if (result) {
          let res = await CRUD("get", SettingsLocationLevelUrl, null, null);
          dispatch(getLevels(res));
        }
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD(
      "delete",
      SettingsLocationLevelUrl,
      null,
      record.id
    );
    if (result) {
      let res = await CRUD("get", SettingsLocationLevelUrl, null, null);
      dispatch(getLevels(res));
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
      let res = await CRUD("get", SettingsLocationLevelUrl, null, null);
      dispatch(getLevels(res));
    }
    levels && levels.length > 0 ? setData(levels) : setData([]);
    uoms && uoms.length > 0 ? setUOMs(uoms) : setUOMs([]);
    initTypes && initTypes.length > 0 ? setTypes(initTypes) : setTypes([]);
    initParentLocations && initParentLocations.length > 0
      ? setParentLocations(initParentLocations)
      : setParentLocations([]);
    initReports && initReports.length > 0
      ? setReports(initReports)
      : setReports([]);
    setLoading(false);
  }, [
    levels,
    uoms,
    initTypes,
    initParentLocations,
    initReports,
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
      sorter: defaultColumnSorter("code"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "TypeId",
      dataIndex: "type_id",
      key: "type_id",
      sorter: defaultColumnSorter("type_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let values = types.filter((item) => item.id === record.type_id);
        return values.length > 0 ? values[0].name : "";
      },
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: defaultColumnSorter("description"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      sorter: defaultColumnSorter("capacity"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "UomId",
      dataIndex: "uom_id",
      key: "uom_id",
      sorter: defaultColumnSorter("uom_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let values = UOMs.filter((item) => item.id === record.uom_id);
        return values.length > 0 ? values[0].name : "";
      },
    },
    {
      title: "ParentLocationId",
      dataIndex: "parent_location_id",
      key: "parent_location_id",
      sorter: defaultColumnSorter("parent_location_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let values = parentLocations.filter(
          (item) => item.id === record.parent_location_id
        );
        return values.length > 0 ? values[0].name : "";
      },
    },
    {
      title: "ReportId",
      dataIndex: "report_id",
      key: "report_id",
      sorter: defaultColumnSorter("report_id"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let values = reports.filter((item) => item.id === record.report_id);
        return values.length > 0 ? values[0].name : "";
      },
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

      sorter: (a, b) =>
        new Date(a.updated_datetime) - new Date(b.updated_datetime),
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
	};

  return (
    <div>
      <PageLayout
				title="SettingsLocationLevel"
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
            name="type_id"
            label="TypeId"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select style={{ width: relative }}>
              {types.map((item, index) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
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
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input />
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
            name="parent_location_id"
            label="ParentLocationId"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select style={{ width: relative }}>
              {parentLocations.map((item, index) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="report_id"
            label="ReportId"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select style={{ width: relative }}>
              {reports.map((item, index) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsLocationLevel;
