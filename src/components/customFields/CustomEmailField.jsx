import React from "react";
import {Input, Form } from "antd";

const CustomEmailField = (props) => {
  const { field } = props;

  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Input type="email" placeholder="Input Email" />
    </Form.Item>
  );
};
export default CustomEmailField;
