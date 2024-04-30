import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomSubtypeSelectField = (props) => {
  const { field } = props;

  const itemSubTypes = useSelector((state) => state.settings.itemSubTypes);
  
  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {itemSubTypes.map((type) => {
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
export default CustomSubtypeSelectField;
