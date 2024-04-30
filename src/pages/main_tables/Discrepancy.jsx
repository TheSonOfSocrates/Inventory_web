import { useCallback, useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Spin, Select } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { OutboundRegistrationUrl, BaseUrl } from "../../utils/network";
import { CRUD, search, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import { useSelector } from "react-redux";
import moment from "moment";
import { dayDataArray, formItemLayout } from "../../utils/data";

const { Search } = Input;
const { Option } = Select;
const Discrepancy = () => {
  let UOMs = useSelector((state) => state.settings.UOMs);
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = OutboundRegistrationUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

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
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "SkuId",
      dataIndex: "sku_id",
      key: "sku_id",
      render: (_, record, index) => {
        let r1 = itemSKUs.filter((item) => item.id === record.sku_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "UomId",
      dataIndex: "uom_id",
      key: "uom_id",
      render: (_, record, index) => {
        let r1 = UOMs.filter((item) => item.id === record.uom_id);
        return r1.length > 0 ? r1[0].name : "";
      },
    },
    {
      title: "AutomaticValue",
      dataIndex: "automatic_value",
      key: "automatic_value",
    },
    {
      title: "ManualValue",
      dataIndex: "manual_value",
      key: "manual_value",
    },
    {
      title: "Difference",
      dataIndex: "difference",
      key: "difference",
    },
  ];

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <span style={{ margin: "0 8px" }} />
          <span
            style={{
              color: "green",
              fontSize: 20,
              fontFamily: "cursive",
            }}
          >
            Discrepancy
          </span>
          <div className="btn-ipt-group">
            <div className="btn-group">
              <div className="refresh-wrapper rightItem">
                <Button icon={<ReloadOutlined />} onClick={refresh}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="search-wrapper rightItem">
              <Select placeholder={"Select a date"} style={{ width: "130px" }}>
                {dayDataArray.map((item, index) => (
                  <Option key={index} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
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
        </div>
      )}
    </>
  );
};

export default Discrepancy;
