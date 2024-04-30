import React from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Input, Space, Form } from "antd";

const CustomPasswordField = (props) => {
  const { field } = props;
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Input.Password
        placeholder="Input Password"
        autoComplete="off"
        iconRender={(visible) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
        }
      />
    </Form.Item>
  );
};
export default CustomPasswordField;
