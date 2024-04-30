import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomUOMSelectField = (props) => {
  const { field } = props;

  const itemUOMs = useSelector((state) => state.settings.UOMs);
  
  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {itemUOMs.map((uom) => {
          return (
            <Option value={uom.id} key={uom.id}>
              {uom.name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomUOMSelectField;
