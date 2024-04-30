import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomPersonSelectField = (props) => {
  const { field } = props;

  const persons = useSelector((state) => state.entities.persons);
  
  return (
    <Form.Item
      colon={false}
      labelCol={{ span: 10 }}
      name={field.name}
      label={field.label}
      rules={[{ required: field.required ?? false }]}
    >
      <Select showSearch filterOption={filterOption}>
        {persons.map((person) => {
          return (
            <Option value={person.id} key={person.id}>
              {person.user_name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomPersonSelectField;
