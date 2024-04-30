import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Form, Row, Col, Space, Button, notification } from "antd";

import GeneralForm from "../../../components/generalForm/GeneralForm";
import PageLayout from "../../../components/PageLayout";
import { formItemLayout } from "../../../utils/data";
import renderGeneralFormFields from "../../../components/generalForm/GeneralFormHelper";
import { CRUD } from "../../../utils/js_functions";
import {
  EntityEmbeddedDeviceUrl,
  BaseUrl,
} from "../../../utils/network";
import { addEmbeddedDevice, updateEmbeddedDevice } from "../../../redux/slice";

const CreateEntityEmbeddedDevice = ({ location }) => {
  const { updatingEntityEmbeddedDevice } = location?.state ?? {
    updatingEntityEmbeddedDevice: null,
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let persons = useSelector((state) => state.entities.persons);
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  

  const onFinish = async (values) => {
    const payLoad = values;
    console.log("[person create] payload ===>", payLoad);
    // return;
    try {
      let result = null;
      if (!isUpdating) {
        const selSKU = itemSKUs.find(
          (sku) => sku.code === values.code
        );
        if (selSKU) {
          notification.error({
            message: "Invalid SKU",
            description: "Pe with this user name already exists.",
          });
          return;
        }
        result = await CRUD("post", EntityEmbeddedDeviceUrl, { ...values }, null);
        if (result) {
            dispatch(addEmbeddedDevice(result))
        }
      } else {
        result = await CRUD(
          "put",
          EntityEmbeddedDeviceUrl,
          payLoad,
          updatingEntityEmbeddedDevice.id
        );
        if (result) {
            dispatch(updateEmbeddedDevice(result));
        }
      }
      if (result) history.push("/embedded_device");
    } catch (error) {
      console.log("[handle create / update embedded device error]", error);
    }
  };

  useEffect(() => {
    if (updatingEntityEmbeddedDevice) {
      setIsUpdating(true);
    } else {
      setIsUpdating(false);
    }
    if (!updatingEntityEmbeddedDevice) return;
    console.log("updatinging entity person ===>", updatingEntityEmbeddedDevice);
    // const {password, ...updatingRecord} = updatingEntityEmbeddedDevice
    form.setFieldsValue(updatingEntityEmbeddedDevice)
  }, [updatingEntityEmbeddedDevice]);

  const formFieldsList = [
    { type: "text", name: "wifi_ssid", label: "Wifi Ssid", required: true },
    { type: "text", name: "wifi_password", label: "Wifi Password", required: true },
    { type: "text", name: "api_url", label: "Api Url"},
    { type: "text", name: "Software Download Link", label: "Software Download Link" },
    { type: "text", name: "ip_address", label: "Ip Address" },
    { type: "text", name: "ble_address", label: "Ble Address" },
    { type: "text", name: "device_code", label: "Device Code", required: true},
    { type: "text", name: "device_name", label: "Device Name", required: true}, 
    
    { type: "text", name: "usb_port", label: "Usb Port"},
    { type: "text", name: "baud_rate", label: "Baud Rate"},
    
    { type: "number", name: "output_one", label: "Output One"},
    { type: "uom-select", name: "uom_output_one", label: "UOM Output One"},
    
    { type: "number", name: "output_two", label: "Output Two"},
    { type: "uom-select", name: "uom_output_two", label: "UOM Output Two"},
    
    { type: "number", name: "output_three", label: "Output Three"},
    { type: "uom-select", name: "uom_output_three", label: "UOM Output Three"},
    
    { type: "number", name: "output_four", label: "Output Four"},
    { type: "uom-select", name: "uom_output_four", label: "UOM Output Four"},
    
    { type: "number", name: "output_five", label: "Output Five"},
    { type: "uom-select", name: "uom_output_five", label: "UOM Output Five"},
    
    {
      type: "access-code-select",
      list: { accessCodes },
      name: "accessCode",
      label: "AccessCode",
    },
  ];

  return (
    <PageLayout title="Create / Update Embedded Device">
      <Form
        className="create-entity-embedded-device-form"
        {...formItemLayout}
        form={form}
        name="CreateEntityEmbeddedDeviceForm"
        onFinish={onFinish}
        // initialValues={formIntialValues}
      >
        <Row gutter={[48, 32]}>
          <Col span={2}></Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(0, 10),
            })}
          </Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(10),
            })}
          </Col>
          <Col span={2}></Col>
        </Row>
        <Form.Item
          colon={false}
          wrapperCol={{ span: 12, offset: 6 }}
          className="form-actions"
          style={{textAlign: 'center'}}
        >
          <Space>
            <Button type="primary" htmlType="submit">
              {isUpdating ? "Update" : "Create"}
            </Button>
            <Button htmlType="reset">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </PageLayout>
  );
};

export default CreateEntityEmbeddedDevice;
