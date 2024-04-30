import React, { useState } from "react";
import { Button, Modal, Form, Input, Select } from "antd";
import { useSelector } from "react-redux";

const { Option } = Select;

const RequestRestockModal = (props) => {
  const {
    title = "title",
    isModalOpen,
    setIsModalOpen,
    handleSubmit,
    initialValues,
  } = props;

  const [form] = Form.useForm();
  const costCenters = useSelector((state) => state.settings.costCenters);
  console.log("===> costCenters: ", costCenters);


  const handleOk = async () => {
    try {
        const values = await form.validateFields();
        form.resetFields();
        console.log('handle OK values ===>', values)
        handleSubmit(values)
        setIsModalOpen(false);
    } catch (error) {
        console.log('Failed:', error);
    }
    
  };
  const handleCancel = async () => {
    setIsModalOpen(false);
  };

  const onCostCenterChange = (value) => {
    console.log('value ==> ', value)
  }

  return (
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
          name="cost_center_id"
          label="Cost Center"
          rules={[{ required: true, message: "Please Select the Cost Center" }]}
        >
          <Select
            showSearch
            placeholder="Select the Cost Center"
            onChange={onCostCenterChange}
          >
            {costCenters.map((cc) => {
              return (
                <Option value={cc.id} key={cc.id}>
                  {cc.name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="generic_code"
          label="Purchase/Restock Code"
          rules={[{ required: true, message: "Please Input the Code" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default RequestRestockModal;
