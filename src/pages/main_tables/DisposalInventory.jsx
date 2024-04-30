import { useCallback, useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Spin, Select } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { DisposalInventoryUrl, BaseUrl } from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { useSelector } from "react-redux";
import moment from "moment";
import { dayDataArray, formItemLayout } from "../../utils/data";
import GeneralTable from "../../components/generalTable/GeneralTable";
import PageLayout from "../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../components/generalTable/GeneralTableHelper";

const { Search } = Input;
const { Option } = Select;
const DisposalInventory = () => {
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = DisposalInventoryUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let persons = useSelector((state) => state.entities.persons);
  let reason = useSelector((state) => state.settings.reasons);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
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
        BaseUrl +
        `api/DisposalInventory/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      setData(res);
    } else {
      let res = await CRUD("get", DisposalInventoryUrl, null, null);
      setData(res);
    }
  };

  // CRUD Operation
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      let changedValues = {
        ...values,
      };
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD(
          "put",
          DisposalInventoryUrl,
          changedValues,
          editId
        );
        if (result) {
          let res = await CRUD("get", DisposalInventoryUrl, null, null);
          setData(res);
        }
      } else {
        let result = await CRUD(
          "post",
          DisposalInventoryUrl,
          changedValues,
          null
        );
        if (result) {
          let res = await CRUD("get", DisposalInventoryUrl, null, null);
          setData(res);
        }
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD("delete", DisposalInventoryUrl, record, record.id);
    if (result) {
      let res = await CRUD("get", DisposalInventoryUrl, null, null);
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

    const response = await CRUD("get", DisposalInventoryUrl, null, null);
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
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Reasons",
      dataIndex: "reasons",
      key: "reasons",
      render: (_, record, index) => {
        let res = reason.filter((item) => item.id === record.reasons);
        return res.length > 0 ? res[0].reasons : "";
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

  const processDataForExcel = () => {
    return data.map((record) => {
      const {status, ...updatedRecord} = record;
      
      const selAccessCode = accessCodes.find((item) => item.id === record.accessCode);
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);      

      const selReason = reason.find((item) => item.id === record.reasons);
      selReason && (updatedRecord.reasons = selReason.reasons)
        
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
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout title="Disposal Inventory">
            <GeneralTable
              data={data}
              columns={columns}
              onSearch={onSearch}
              onRefresh={refresh}
              processDataForExcel={processDataForExcel}
              paperSize="A4"
            />
          </PageLayout>          
          {/* Modal for Add/Edit */}
          <Modal title="Loading Data" open={visible} footer={null}>
            <Loading />
          </Modal>
        </div>
      )}
    </>
  );
};

export default DisposalInventory;
