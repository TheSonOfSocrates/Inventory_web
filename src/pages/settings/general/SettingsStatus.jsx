import { useCallback, useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Spin } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { SettingsStatusUrl } from "../../../utils/network";
import { op_status } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { formItemLayout } from "../../../../src/utils/data";
import { useSelector, useDispatch } from "react-redux";
import { getStatus } from "../../../redux/slice";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const SettingsStatus = () => {
  const dispatch = useDispatch();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let initialStatus = useSelector((state) => state.settings.status);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        setEditingItem(null);
        let result = await op_status("put", SettingsStatusUrl, values, editId);
      } else {
        let result = await op_status("post", SettingsStatusUrl, values, null);
        if (result) {
          let res = await op_status("get", SettingsStatusUrl, null, null);
          dispatch(getStatus(res));
        }
      }
    });
  };

  // const handleEdit = (record) => {
  //   setEditingItem(record);
  //   setEditId(record.id);
  //   form.setFieldsValue(record);
  //   setIsModalVisible(true);
  // };

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
      let res = await op_status("get", SettingsStatusUrl, null, null);
      dispatch(getStatus(res));
    }
    initialStatus && initialStatus.length > 0
      ? setData(initialStatus)
      : setData([]);
    setLoading(false);
  }, [initialStatus, isLoading, loading]);

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
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
    },
  ];

  const processDataForExcel = () => {
    return data;
  }

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="SettingsStatus"
            titleRightAction={() =>
              userPerm && userPerm.perm_create_settings === "1" ? (
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
              // onSearch={onSearch}
              // onRefresh={refresh}
              processDataForExcel={processDataForExcel}
              paperSize="A1"
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
      )}
    </>
  );
};

export default SettingsStatus;
