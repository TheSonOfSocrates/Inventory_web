import React from "react";
import { Input, Form, Select } from "antd";
import { useSelector } from "react-redux";
import { filterOption } from "../generalForm/GeneralFormHelper";

const { Option } = Select;

const CustomRoleSelectField = (props) => {
  const { field } = props;

  let rolesAndPermissions = useSelector(
    (state) => state.settings.rolesAndPermissions
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
        {rolesAndPermissions.map((role) => {
          return (
            <Option value={role.id} key={role.id}>
              {role.name}
            </Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};
export default CustomRoleSelectField;
