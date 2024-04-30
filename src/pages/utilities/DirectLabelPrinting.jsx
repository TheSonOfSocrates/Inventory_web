import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Spin,
  List,
  Select,
  DatePicker,
} from "antd";
import { EditOutlined , ReloadOutlined } from "@ant-design/icons";
import { DirectLabelPrintingUrl, EntityEmbeddedDeviceUrl } from "../../utils/network";
import { CRUD } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import {
  getDirectLabelPrinting,
  updateDirectLabelPrinting,
} from "../../redux/slice";
import { useDispatch, useSelector } from "react-redux";
import { relative } from "path";
import moment from "moment";
import { formItemLayout } from "../../../src/utils/data";

const { Option } = Select;

const DirectLabelPrinting = () => {
  const [data, setData] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(false);
  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [res, setRes] = useState({});
  const [embeddedDeviceInfo, setEmbeddedDeviceInfo] = useState({})
  const [embeddedDeviceId, setEmbeddedDeviceId] = useState(null)
  const dispatch = useDispatch();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);

  const directLabelPrinting = useSelector(
    (state) => state.utilities.directLabelPrinting
  );
  const warehouses = useSelector((state) => state.settings.warehouses);
  const branches = useSelector((state) => state.settings.branches);
  const companies = useSelector((state) => state.entities.companies);
  const embeddedDevices = useSelector(
    (state) => state.entities.embeddedDevices
  );
  const uoms = useSelector((state) => state.settings.UOMs);

  const listTitles = [
    {
      title: "Item Id",
    },
    {
      title: "Weight",
    },
    {
      title: "Uom Id",
    },
    {
      title: "Production Date",
    },
    {
      title: "Source Branch Id",
    },
    {
      title: "Source Warehouse Id",
    },
    {
      title: "Customer Id",
    },
    {
      title: "Dispatch Date",
    },
    {
      title: "Embedded Device Id",
    },
    {
      title: "Print Reference",
    },
  ];

  const getEmbededDeviceInfo = async (id) => {
    console.log('getEmbededDeviceInfo for', id)
    const result = await CRUD(
      "get",
      EntityEmbeddedDeviceUrl + "/" + id + "?fields=output_one",
      {},
      id
    );

    console.log('result', result)
    setEmbeddedDeviceId(id)
    setEmbeddedDeviceInfo(result)
  }

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        let changedValues = {
          ...values,
          production_date: values.production_date.format("YYYY-MM-DD"),
          dispatch_date: values.dispatch_date.format("YYYY-MM-DD"),
          embedded_device_id: embeddedDeviceId,
        };
        const updatedRes = await CRUD(
          "put",
          DirectLabelPrintingUrl,
          changedValues,
          editId
        );
        dispatch(updateDirectLabelPrinting(updatedRes));
        setEditingItem(false);
      } else {
        let newValues = {
          ...values,
          production_date: values.production_date.format("YYYY-MM-DD"),
          dispatch_date: values.dispatch_date.format("YYYY-MM-DD"),
        };
        let result = await CRUD(
          "post",
          DirectLabelPrintingUrl,
          newValues,
          null
        );
        if (result) {
          dispatch(getDirectLabelPrinting(result));
        }
      }
    });
  };

  // Function to handle Edit button click

  const handleEdit = (values) => {
    let changedValues = {
      ...values,
      dispatch_date: moment(values.dispatch_date),
      production_date: moment(values.production_date),
    };

    setIsModalVisible(true);
    if (data && data.length > 0) setEditingItem(true);
    else setEditingItem(false);
    setEditId(values.id);
    form.setFieldsValue(changedValues);
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
    
    setLoading(true);
    let updatedListTitles = [...listTitles];
    if (directLabelPrinting && directLabelPrinting.source_warehouse_id) {
      setRes(directLabelPrinting);
      let jsonData = { ...directLabelPrinting };

      if (uoms && warehouses && branches && embeddedDevices && companies) {
        const uom = uoms.filter((item, index) => item.id === jsonData.uom_id);
        jsonData.uom_id = uom.length > 0 ? uom[0].name : "no data";

        const warehouse = warehouses.filter(
          (item, index) => item.id === jsonData.source_warehouse_id
        );
        jsonData.source_warehouse_id =
          warehouse.length > 0 ? warehouse[0].name : "no data";
        const branch = branches.filter(
          (item, index) => item.id === jsonData.source_branch_id
        );
        jsonData.source_branch_id =
          branch.length > 0 ? branch[0].name : "no data";

        const embeddedDevice = embeddedDevices.filter(
          (item, index) => item.id === jsonData.embedded_device_id
        );
        jsonData.embedded_device_id =
          embeddedDevice.length > 0 ? embeddedDevice[0].device_name : "no data";

        const company = companies.filter(
          (item, index) => item.id === jsonData.customer_id
        );

        jsonData.customer_id = company.length > 0 ? company[0].name : "no data";
      }

      updatedListTitles = listTitles.map((item) => {
        const key = item.title.toLowerCase().replace(/ /g, "_");
        if (jsonData[key] !== undefined) {
          return { ...item, description: jsonData[key] };
        }
        return item;
      });

      setData(updatedListTitles);
    } else setData([]);
    setLoading(false);
  }, [warehouses, branches, companies, embeddedDevices, directLabelPrinting]);

  useEffect(() => {
    if (!warehouses || warehouses.length === 0) {
      return;
    }
    getItem();
  }, [warehouses, branches, companies, embeddedDevices, directLabelPrinting]);

  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          {userPerm && userPerm.perm_create_utilities === "1" ? (
            <Button
              type="circle"
              style={{
                color: "white",
                background: "green",
              }}
              onClick={() => handleEdit(res)}
              // onClick={() => handleEdit(record)
            >
              <EditOutlined style={{ size: 20 }} />
            </Button>
          ) : null}

          <span style={{ margin: "0 8px" }} />
          <span
            style={{
              color: "green",
              fontSize: 20,
              fontFamily: "cursive",
            }}
          >
            Direct Label Printing
          </span>
          <List
            itemLayout="horizontal"
            dataSource={data.map((item, index) => ({
              ...item,
              key: index,
            }))}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                      {item.title}
                    </span>
                  }
                  description={
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      {item.description}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
          {/* Modal for Add/Edit */}

          <Modal
            open={isModalVisible}
            title={editingItem ? "Edit Item" : "Add New Record"}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={handleOk}
          >
            {/* {JSON.stringify({form,embeddedDeviceInfo})} */}
            <Form form={form} {...formItemLayout}>
              <Form.Item
                name="item_id"
                label="Item Id"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="weight"
                label="Weight"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="uom_id"
                label="Uom Id"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {uoms?.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="production_date"
                label="Production Date"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker style={{ width: relative }} />
              </Form.Item>
              <Form.Item
                name="source_branch_id"
                label="Source Branch Id"
                rules={[
                  {
                    required: true,
                    message: "Please select a location branch",
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {branches.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="source_warehouse_id"
                label="Source Warehouse Id"
                rules={[
                  {
                    required: true,
                    message: "Please select a location warehouse",
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {warehouses.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="customer_id"
                label="Customer Id"
                rules={[
                  {
                    required: true,
                    message: "Please select a company",
                  },
                ]}
              >
                <Select style={{ width: relative }}>
                  {companies.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="dispatch_date"
                label="Dispatch Date"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker style={{ width: relative }} />
              </Form.Item>
              <Form.Item
                name="embedded_device_id"
                label="Embedded Device Id"
                rules={[
                  {
                    required: true,
                    message: "Please select a embeddedDevice",
                  },
                ]}
              >
                <Select style={{ width: relative }} onChange={e => getEmbededDeviceInfo(e)}>
                  {embeddedDevices.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.device_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="print_reference"
                label="Print Reference"
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

export default DirectLabelPrinting;
