import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Table,
  Button,
  Select,
  Modal,
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
import { EntityCompanyUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getCompanies } from "../../../redux/slice";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const { Search } = Input;
const { Option } = Select;

const Company = () => {
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [persons, setPersons] = useState([]);
  const [searchValue, setSearchValue] = useState(null);

  const dispatch = useDispatch();
  const history = useHistory();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = EntityCompanyUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  const companies = useSelector((state) => state.entities.companies);
  const per = useSelector((state) => state.entities.persons);
  const rolesAndPermissions = useSelector(
    (state) => state.settings.rolesAndPermissions
  );
  console.log("baseurl from company page", BaseUrl);

  //Search
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl + `api/EntityCompany/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getCompanies(res));
    } else {
      let res = await CRUD("get", EntityCompanyUrl, null, null);
      dispatch(getCompanies(res));
    }
  };

  //Sort Operation

  const handleDelete = async (record) => {
    let result = await CRUD("delete", EntityCompanyUrl, record, record.id);
    if (result) {
      let res = await CRUD("get", EntityCompanyUrl, null, null);
      dispatch(getCompanies(res));
    }
  };

  const handleCreate = () => {
    history.push("/create_company");
  };
  const handleEdit = (record) => {
    console.log("Edit person edit record ===>", record);
    history.push({
      pathname: "/create_company",
      state: { updatingEntityCompany: record },
    });
    return;
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
      let res = await CRUD("get", EntityCompanyUrl, null, null);
      dispatch(getCompanies(res));
    }
    companies && companies.length > 0 ? setData(companies) : setData([]);
    per && per.length > 0 ? setPersons(per) : setPersons([]);
    rolesAndPermissions && rolesAndPermissions.length > 0
      ? setRoles(rolesAndPermissions)
      : setRoles([]);
    setLoading(false);
  }, [per, searchValue, isLoading, companies, rolesAndPermissions, loading]);

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
      sortDirections: ['ascend', 'descend'],
      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: defaultColumnSorter("code"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: defaultColumnSorter("address"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Geolocation",
      dataIndex: "geolocation",
      key: "geolocation",
      sorter: defaultColumnSorter("geolocation"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "ContactNumber1",
      dataIndex: "contact_number_1",
      key: "contact_number_1",
      sorter: defaultColumnSorter("contact_number_1"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "ContactNumber2",
      dataIndex: "contact_number_2",
      key: "contact_number_2",
      sorter: defaultColumnSorter("contact_number_2"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Email1",
      dataIndex: "email_1",
      key: "email_1",
      sorter: defaultColumnSorter("email_1"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Email2",
      dataIndex: "email_2",
      key: "email_2",
      sorter: defaultColumnSorter("email_2"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "ContactPerson1",
      dataIndex: "contact_person_1",
      key: "contact_person_1",
      sorter: defaultColumnSorter("contact_person_1"),
      sortDirections: ['ascend', 'descend'],
      render: (_, record, index) => {
        let p1 = persons.filter((item) => item.id === record.contact_person_1);
        return p1.length > 0 ? p1[0].user_name : "";
      },
    },
    {
      title: "ContactPerson2",
      dataIndex: "contact_person_2",
      key: "contact_person_2",
      sorter: defaultColumnSorter("contact_person_2"),
      sortDirections: ['ascend', 'descend'],
      render: (_, record, index) => {
        let p2 = persons.filter((item) => item.id === record.contact_person_2);
        return p2.length > 0 ? p2[0].user_name : "";
      },
    },
    {
      title: "Role1",
      dataIndex: "role1_id",
      key: "role1_id",
      sorter: defaultColumnSorter("role1_id"),
      sortDirections: ['ascend', 'descend'],
      render: (_, record, index) => {
        let r1 = roles.filter((item) => item.id === record.role1_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "Role2",
      dataIndex: "role2_id",
      key: "role2_id",
      sorter: defaultColumnSorter("role2_id"),
      sortDirections: ['ascend', 'descend'],
      render: (_, record, index) => {
        let r2 = roles.filter((item) => item.id === record.role2_id);
        return r2.length > 0 ? r2[0].name : "";
      },
    },
    {
      title: "Role3",
      dataIndex: "role3_id",
      key: "role3_id",
      sorter: defaultColumnSorter("role3_id"),
      sortDirections: ['ascend', 'descend'],
      render: (_, record, index) => {
        let r3 = roles.filter((item) => item.id === record.role3_id);
        return r3.length > 0 ? r3[0].name : "";
      },
    },
    {
      title: "CreatedDateTime",
      dataIndex: "created_datetime",
      key: "created_datetime",
      sorter: defaultColumnSorter("created_datetime"),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "PersonIdCreatedBy",
      dataIndex: "person_id_createdby",
      key: "person_id_createdby",
      sorter: defaultColumnSorter("person_id_createdby"),
      sortDirections: ['ascend', 'descend'],
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
      sortDirections: ["descend", "ascend"]
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      sorter: defaultColumnSorter("person_id_updatedby"),
      sortDirections: ['ascend', 'descend'],
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
      const { status, company_type, ...updatedRecord } = record;
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

      let selContactPerson1 = persons.find((item) => item.id === record.contact_person_1);
      selContactPerson1 && (updatedRecord.contact_person_1 = selContactPerson1.user_name)
      
      let selContactPerson2 = persons.find((item) => item.id === record.contact_person_2);
      selContactPerson2 && (updatedRecord.contact_person_2 = selContactPerson1.user_name)

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
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="Company"
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

export default Company;
