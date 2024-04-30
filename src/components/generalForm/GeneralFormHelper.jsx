import React from "react";
import { Form, Input, InputNumber} from "antd";
import CustomPasswordField from "../customFields/CustomPasswordField";
import CustomEmailField from "../customFields/CustomEmailField";
import CustomPhoneField from "../customFields/CustomPhoneField";
import CustomRoleSelectField from "../customFields/CustomRoleSelectField";
import CustomAccessCodeSelectField from "../customFields/CustomAccessCodeSelectField";
import CustomPersonSelectField from "../customFields/CustomPersonSelectField";
import CustomNumberInputField from "../customFields/CustomNumberInputField";
import CustomTypeSelectField from "../customFields/CustomTypeSelectField";
import CustomCategorySelectField from "../customFields/CustomCategorySelectField";
import CustomSubtypeSelectField from "../customFields/CustomSubtypeSelectField";
import CustomSubCategoryField from "../customFields/CustomSubcategorySelectField";
import CustomUOMSelectField from "../customFields/CustomUOMSelectField";

const { TextArea } = Input;

export const filterOption = (inputValue, option) => {
  return option.children.toLowerCase().includes(inputValue.toLowerCase());
};

const renderGeneralFormFields = (props) => {
  const { formFieldsList } = props;

  return formFieldsList.map((field) => {
    switch (field.type) {
      case "text":
        return (
          <Form.Item
            colon={false}
            labelCol={{ span: 10 }}
            name={field.name}
            label={field.label}
            rules={[
              {
                required: field.required ?? false,
              },
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
        );
      case "number":
        return <CustomNumberInputField field={field} />;
      case "text-area":
        return (
          <Form.Item
            colon={false}
            labelCol={{ span: 10 }}
            name={field.name}
            label={field.label}
            rules={[
              {
                required: field.required ?? false,
              },
            ]}
          >
            <TextArea rows={field.rows ?? 4} />
          </Form.Item>
        );
      case "switch":
        return (
          <Form.Item
            colon={false}
            labelCol={{ span: 10 }}
            name={field.name}
            label={field.label}
            rules={[
              {
                required: field.required ?? false,
              },
            ]}
          >
            <InputNumber
              style={{width: '100%'}}
              placeholder={"0 OR 1"}
              min={0}
              max={1}
              defaultValue={0}
            />
          </Form.Item>
        );
      case "password":
        return <CustomPasswordField field={field} />;
      case "email":
        return <CustomEmailField field={field} />;
      case "phone":
        return <CustomPhoneField field={field} />;
      case "role-select":
        return <CustomRoleSelectField field={field} />;
      case "access-code-select":
        return <CustomAccessCodeSelectField field={field} />;
      case "person-select":
        return <CustomPersonSelectField field={field} />;
      case "type-select":
        return <CustomTypeSelectField field={field} />;
      case "subtype-select":
        return <CustomSubtypeSelectField field={field} />;
      case "category-select":
        return <CustomCategorySelectField field={field} />;
      case "subcategory-select":
        return <CustomSubCategoryField field={field} />;
      case "uom-select":
        return <CustomUOMSelectField field={field} />;
      default:
        return null;
    }
  });
};

export default renderGeneralFormFields;
