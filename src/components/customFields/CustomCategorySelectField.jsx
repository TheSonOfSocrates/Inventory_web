import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomCategorySelectField = (props) => {
  const { field } = props;

  const itemCategories = useSelector((state) => state.settings.itemCategories);
  
  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {itemCategories.map((category) => {
          return (
            <Option value={category.id} key={category.id}>
              {category.name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomCategorySelectField;
