import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomAccessCodeSelectField = (props) => {
  const { field } = props;

  let accessCodes = useSelector((state) => state.settings.accessCodes);
  
  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {accessCodes.map((ac) => {
          return (
            <Option value={ac.id} key={ac.id}>
              {ac.name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomAccessCodeSelectField;
