import React from "react";
import {Input, Form } from "antd";

const CustomPhoneField = (props) => {
  const { field } = props;

  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Input type="tel" placeholder="Input Phone Number" />
    </Form.Item>
  );
};
export default CustomPhoneField;
