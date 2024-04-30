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
  Select,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { EntityEmbeddedDeviceUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getEmbeddedDevices } from "../../../redux/slice";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const { Search } = Input;
const { Option } = Select;

const EmbeddedDevice = () => {
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [UOMs, setUOMs] = useState([]);
  const [editId, setEditId] = useState(null);

  const history = useHistory();
  const dispatch = useDispatch();
  let persons = useSelector((state) => state.entities.persons);
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = EntityEmbeddedDeviceUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();

  let embeddedDevices = useSelector((state) => state.entities.embeddedDevices);
  let uoms = useSelector((state) => state.settings.UOMs);

  const onRefresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl +
        `api/EntityEmbeddedDevice/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getEmbeddedDevices(res));
    } else {
      let res = await CRUD("get", EntityEmbeddedDeviceUrl, null, null);
      dispatch(getEmbeddedDevices(res));
    }
  };

  const handleDelete = async (record) => {
    let result = await CRUD(
      "delete",
      EntityEmbeddedDeviceUrl,
      record,
      record.id
    );
    if (result) {
      let res = await CRUD("get", EntityEmbeddedDeviceUrl, null, null);
      dispatch(getEmbeddedDevices(res));
    }
  };

  const handleCreate = () => {
    history.push("/create_embedded_device");
  };

  const handleEdit = (record) => {
    console.log("Edit item Embedded Device ===>", record);
    history.push({
      pathname: "/create_embedded_device",
      state: { updatingEntityEmbeddedDevice: record },
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
      let res = await CRUD("get", EntityEmbeddedDeviceUrl, null, null);
      dispatch(getEmbeddedDevices(res));
    }
    embeddedDevices && embeddedDevices.length > 0
      ? setData(embeddedDevices)
      : setData([]);
    uoms && uoms.length > 0 ? setUOMs(uoms) : setUOMs([]);
    setLoading(false);
  }, [embeddedDevices, uoms, isLoading, loading]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  const processDataForExcel = () => {
    return data.map((record) => {
      const { status, ...updatedRecord } = record;
      const selAccessCode = accessCodes.find(
        (item) => item.id === record.accessCode
      );
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);
      const selUOMOne = UOMs.find((item) => item.id === record.uom_output_one);
      selUOMOne && (updatedRecord.uom_output_one = selUOMOne.name);
      const selUOMTwo = UOMs.find((item) => item.id === record.uom_output_two);
      selUOMTwo && (updatedRecord.uom_output_two = selUOMTwo.name);
      const selUOMThree = UOMs.find(
        (item) => item.id === record.uom_output_three
      );
      selUOMThree && (updatedRecord.uom_output_three = selUOMThree.name);
      const selUOMFour = UOMs.find(
        (item) => item.id === record.uom_output_four
      );
      selUOMFour && (updatedRecord.uom_output_four = selUOMFour.name);
      const selUOMFive = UOMs.find(
        (item) => item.id === record.uom_output_five
      );
      selUOMFive && (updatedRecord.uom_output_five = selUOMFive.name);

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
        <div className="action-column">
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
      title: "WifiSsid",
      dataIndex: "wifi_ssid",
      key: "wifi_ssid",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("wifi_ssid"),
    },
    {
      title: "WifiPassword",
      dataIndex: "wifi_password",
      key: "wifi_password",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("wifi_password"),
    },
    {
      title: "ApiUrl",
      dataIndex: "api_url",
      key: "api_url",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("api_url"),
    },
    {
      title: "SoftwareDownloadLink",
      dataIndex: "software_download_link",
      key: "software_download_link",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("software_download_link"),
    },
    {
      title: "IpAddress",
      dataIndex: "ip_address",
      key: "ip_address",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("ip_address"),
    },
    {
      title: "BleAddress",
      dataIndex: "ble_address",
      key: "ble_address",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("ble_address"),
    },
    {
      title: "DeviceCode",
      dataIndex: "device_code",
      key: "device_code",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("device_code"),
    },
    {
      title: "DeviceName",
      dataIndex: "device_name",
      key: "device_name",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("device_name"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "UsbPort",
      dataIndex: "usb_port",
      key: "usb_port",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("usb_port"),
    },
    {
      title: "BaudRate",
      dataIndex: "baud_rate",
      key: "baud_rate",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("baud_rate"),
    },
    {
      title: "OutputOne",
      dataIndex: "output_one",
      key: "output_one",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("output_one"),
    },
    {
      title: "UOMOutputOne",
      dataIndex: "uom_output_one",
      key: "uom_output_one",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("uom_output_one"),
      render: (_, record, index) => {
        let res = UOMs.filter((item) => item.id === record.uom_output_one);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "OutputTwo",
      dataIndex: "output_two",
      key: "output_two",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter(""),
    },
    {
      title: "UOMOutputTwo",
      dataIndex: "uom_output_two",
      key: "uom_output_two",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("uom_output_two"),
      render: (_, record, index) => {
        let res = UOMs.filter((item) => item.id === record.uom_output_two);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "OutputThree",
      dataIndex: "output_three",
      key: "output_three",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("output_three"),
    },
    {
      title: "UOMOutputThree",
      dataIndex: "uom_output_three",
      key: "uom_output_three",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("uom_output_three"),
      render: (_, record, index) => {
        let res = UOMs.filter((item) => item.id === record.uom_output_three);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "OutputFour",
      dataIndex: "output_four",
      key: "output_four",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("output_four"),
    },
    {
      title: "UOMOutputFour",
      dataIndex: "uom_output_four",
      key: "uom_output_four",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("uom_output_four"),
      render: (_, record, index) => {
        let res = UOMs.filter((item) => item.id === record.uom_output_four);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "OutputFive",
      dataIndex: "output_five",
      key: "output_five",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("output_five"),
    },
    {
      title: "UOMOutputFive",
      dataIndex: "uom_output_five",
      key: "uom_output_five",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("uom_output_five"),
      render: (_, record, index) => {
        let res = UOMs.filter((item) => item.id === record.uom_output_five);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      sortDirections: ["descend", "ascend"],
      sorter: defaultColumnSorter("message"),
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

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="EmbeddedDevice"
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
              onRefresh={onRefresh}
              onUpload={(options) => customRequest(options, tableName)}
              isPrint={true}
              isDownloadExcel={true}
              processDataForExcel={processDataForExcel}
              paperSize="A1"
            />
            <Modal title="Loading Data" open={visible} footer={null}>
              <Loading />
            </Modal>
          </PageLayout>
        </div>
      )}
    </>
  );
};

export default EmbeddedDevice;
