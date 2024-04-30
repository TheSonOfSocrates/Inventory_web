import React from "react";
import { InputNumber, Form } from "antd";

const CustomNumberInputField = (props) => {
  const { field } = props;

  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <InputNumber style={{width: '100%'}}/>
    </Form.Item>
  );
};
export default CustomNumberInputField;
