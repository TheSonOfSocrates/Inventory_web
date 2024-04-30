import React, { useEffect, useState } from "react";
import { ChangePasswordUrl, EntityPersonUrl } from "./network";
import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import { CRUD } from "./js_functions";
import { useDispatch } from "react-redux";
import { updatePersons } from "../redux/slice";
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 20,
    },
  },
};
const UpdatePassword = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
 
      let updatedUser = await CRUD("post", ChangePasswordUrl, values, null);

      form.resetFields()

      console.log(updatedUser)
  
  };
  // const getItem = async () => {
  //   let res = JSON.parse(localStorage.getItem("currentUser"));
  //   if (res) form.setFieldsValue(res);
  // };
  // useEffect(() => {
  //   getItem();
  // }, [getItem]);

  return (
    <Collapse showArrow={false}
      size="large"
      items={[{ key: '1', label: 'Change Password', children: <Form
      {...formItemLayout}
      form={form}
      name="change password "
      onFinish={onFinish}
      initialValues={{
        prefix: "86",
      }}
      style={{
        maxWidth: 600,
      }}
      scrollToFirstError
    >
      
      <Form.Item
        name="old_password"
        label="Old Password"
        rules={[
          {
            message: "Please input your old password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password
          style={{ border: "1px solid #d9d9d9"  }}
          readOnly={false }
        />
      </Form.Item>
      <Form.Item
        name="new_password"
        label="New Password"
        rules={[
          {
            message: "Please input your new password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password
          style={{ border: "1px solid #d9d9d9" }}
          readOnly={false }
        />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm New Password"
        dependencies={["new_password"]}
        hasFeedback
        rules={[
          {
            message: "Please confirm your new password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("new_password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The new password that you entered do not match!")
              );
            },
          }),
        ]}
      >
        <Input.Password
          style={{ border: "1px solid #d9d9d9" }}
          readOnly={false}
        />
      </Form.Item>

      <Form.Item >
        <Button type="primary" htmlType="submit">
          Update Password
        </Button>
      </Form.Item>


    </Form> 
    }]}
    />
    
  );
};
export default UpdatePassword;
