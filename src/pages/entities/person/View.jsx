import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Select,
  Form,
  Input,
  Spin,
  Popconfirm,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { EntityPersonUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

import { useDispatch, useSelector } from "react-redux";
import { getPersons } from "../../../redux/slice";

const { Search } = Input;
const { Option } = Select;
const Person = () => {
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisable] = useState(false);

  const [editId, setEditId] = useState(null);
  const [roles, setRoles] = useState([]);

  const dispatch = useDispatch();
  const history = useHistory();

  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = EntityPersonUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let persons = useSelector((state) => state.entities.persons);
  let rolesAndPermissions = useSelector(
    (state) => state.settings.rolesAndPermissions
  );

  //Search
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl + `api/EntityPerson/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getPersons(res));
    } else {
      let res = await CRUD("get", EntityPersonUrl, null, null);
      dispatch(getPersons(res));
    }
  };

  //Sort Operation

  //Modal Open
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    let result = await CRUD("delete", EntityPersonUrl, record, record.id);
    if (result) {
      let res = await CRUD("get", EntityPersonUrl, null, null);
      dispatch(getPersons(res));
    }
  };

  const handleCreate = () => {
    history.push("create_person");
  };

  const handleEdit = (record) => {
    console.log(" handle person edit record==>", record);
    history.push({
      pathname: "/create_person",
      state: { updatingEntityPerson: record },
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
      let res = await CRUD("get", EntityPersonUrl, null, null);
      dispatch(getPersons(res));
    }
    rolesAndPermissions && rolesAndPermissions.length > 0
      ? setRoles(rolesAndPermissions)
      : setRoles([]);
    persons && persons.length > 0 ? setData(persons) : setData([]);
    setLoading(false);
  }, [persons, rolesAndPermissions, isLoading, loading]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  // Table columns configuration
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
      title: "First_Name",
      dataIndex: "first_name",
      key: "first_name",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("first_name"),
    },
    {
      title: "Middle_Name",
      dataIndex: "middle_name",
      key: "middle_name",
      sorter: defaultColumnSorter("middle_name"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Last_Name",
      dataIndex: "last_name",
      key: "last_name",
      sorter: defaultColumnSorter("last_name"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "User_Name",
      dataIndex: "user_name",
      key: "user_name",
      sorter: defaultColumnSorter('user_name'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: defaultColumnSorter('code'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "AccessCodes",
      dataIndex: "accessCode",
      key: "accessCode",
      sorter: defaultColumnSorter('accessCode'),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: defaultColumnSorter('address'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Geolocation",
      dataIndex: "geolocation",
      key: "geolocation",
      sorter: defaultColumnSorter('geolocation'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Contact_Number_1",
      dataIndex: "contact_number_1",
      key: "contact_number_1",
      sorter: defaultColumnSorter('contact_number_1'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Contact_Number_2",
      dataIndex: "contact_number_2",
      key: "contact_number_2",
      sorter: defaultColumnSorter('contact_number_2'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Email_1",
      dataIndex: "email_1",
      key: "email_1",
      sorter: defaultColumnSorter('email_1'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Email_2",
      dataIndex: "email_2",
      key: "email_2",
      sorter: defaultColumnSorter('email_2'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Role1",
      dataIndex: "role1_id",
      key: "role1_id",
      sorter: defaultColumnSorter('role1_id'),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let r1 = roles.filter((item) => item.id === record.role1_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "Role2",
      dataIndex: "role2_id",
      key: "role2_id",
      sorter: defaultColumnSorter('role2_id'),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let r2 = roles.filter((item) => item.id === record.role2_id);
        return r2.length > 0 ? r2[0].name : "";
      },
    },
    {
      title: "Role3",
      dataIndex: "role3_id",
      key: "role3_id",
      sorter: defaultColumnSorter('role3_id'),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let r3 = roles.filter((item) => item.id === record.role3_id);
        return r3.length > 0 ? r3[0].name : "";
      },
    },
    {
      title: "CreatedDateTime",
      dataIndex: "created_datetime",
      key: "created_datetime",
      sorter: dateColumnSorter('created_datetime'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdCreatedBy",
      dataIndex: "person_id_createdby",
      key: "person_id_createdby",
      sorter: defaultColumnSorter('person_id_createdby'),
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
      sorter: dateColumnSorter('updated_datetime'),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      sorter: defaultColumnSorter('person_id_updatedby'),
      sortDirections: ["descend", "ascend"],
      key: "person_id_updatedby",
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
      const { status, password, ...updatedRecord } = record;
      const selAccessCode = accessCodes.find(
        (item) => item.id === record.accessCode
      );
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);

      const selRole1 = roles.find((item) => item.id === record.role1_id);
      selRole1 && (updatedRecord.role1_id = selRole1.name);

      const selRole2 = roles.find((item) => item.id === record.role2_id);
      selRole2 && (updatedRecord.role2_id = selRole2.name);

      const selRole3 = roles.find((item) => item.id === record.role3_id);
      selRole3 && (updatedRecord.role3_id = selRole3.name);

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
            title="Person"
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

export default Person;
