import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomTypeSelectField = (props) => {
  const { field } = props;

  const itemTypes = useSelector((state) => state.settings.itemTypes);
  
  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {itemTypes.map((type) => {
          return (
            <Option value={type.id} key={type.id}>
              {type.name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomTypeSelectField;
