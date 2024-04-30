import React, { useState } from "react";
import { Button, Modal, Form, Input, Select } from "antd";
import { useSelector } from "react-redux";
import { relative } from "path";
import { EntityEmbeddedDeviceUrl } from "../../utils/network";
import { CRUD } from "../../utils/js_functions";

const { Option } = Select;

const SelectEmbededDevice = (props) => {
  const {
    title = "Select Weighting Scale",
    // isModalOpen,
    // setIsModalOpen,
    onChange,
    initialValues,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [embeddedDeviceInfo, setEmbeddedDeviceInfo] = useState({})

  const [form] = Form.useForm();
  const embeddedDevices = useSelector(
    (state) => state.entities.embeddedDevices
  );

  const handleOk = async () => {
    try {
        const values = await form.validateFields();
        form.resetFields();
        console.log('handle OK values ===>', {...values, output_one: embeddedDeviceInfo.output_one })
        // onChange({...values, output_one: embeddedDeviceInfo.output_one })
        onChange(embeddedDeviceInfo.output_one)
        setIsModalOpen(false);
    } catch (error) {
        console.log('Failed:', error);
    }
    
  };
  const handleCancel = async () => {
    setIsModalOpen(false);
  };

  const toggleModal = () => setIsModalOpen(p => !p)

  const getEmbededDeviceInfo = async (id) => {
    // console.log('getEmbededDeviceInfo for', id)
    const result = await CRUD(
      "get",
      EntityEmbeddedDeviceUrl + "/" + id + "?fields=output_one",
      {},
      id
    );

    console.log('result', result)
    // form.setFieldValue('output_one', result.output_one)
    setEmbeddedDeviceInfo(result)
  }

  return (
    <>
      <Button htmlType="submit" type="primary" block onClick={toggleModal} disabled={props.disabled}>
        Weight
      </Button>
      <Modal
        title={title}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          layout="vertical"
          form={form}
          name="form_in_modal"
          initialValues={initialValues}
        >
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
         
        </Form>
      </Modal>
    </>
  );
};
export default SelectEmbededDevice;
