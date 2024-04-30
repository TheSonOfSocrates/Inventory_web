import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomSubCategoryField = (props) => {
  const { field } = props;

  const itemSubCategories = useSelector(
    (state) => state.settings.itemSubCategories
  );

  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {itemSubCategories.map((subcategory) => {
          return (
            <Option value={subcategory.id} key={subcategory.id}>
              {subcategory.name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomSubCategoryField;
