import React, { useEffect, useState } from "react";
import { EntityPersonUrl } from "../utils/network";
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
const UserProfileModal = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [editable, setEditable] = useState(false);

  const onFinish = async (values) => {
    console.log(values)
    let currentUser = await JSON.parse(localStorage.getItem("currentUser"));
    let editId = currentUser.id;
    if (editable) {
      values["password"]=currentUser.password
      console.log(values)
      let updatedUser = await CRUD("put", EntityPersonUrl, values, editId);
      if (updatedUser) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        console.log("updateUser from put function", updatedUser)
        // console.log("updateUser from put function", updatedUser)

        form.setFieldsValue(updatedUser);
        
      }
      setEditable(false);
    }
     setEditable(true);
  };
  const getItem = async () => {
    let res = JSON.parse(localStorage.getItem("currentUser"));
    if (res) form.setFieldsValue(res);
  };
  useEffect(() => {
    getItem();
  }, [getItem]);
  const [autoCompleteResult, setAutoCompleteResult] = useState([]);

  return (
    <Form
      {...formItemLayout}
      form={form}
      name="register"
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
        name="first_name"
        label="First Name"
        rules={[
          {
            type: "text",
          },
          {
            message: "Please input your First Name",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>
      <Form.Item
        name="middle_name"
        label="Middle Name"
        rules={[
          {
            type: "text",
          },
          {
            message: "Please input your Middle Name",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>
      <Form.Item
        name="last_name"
        label="Last Name"
        rules={[
          {
            type: "text",
          },
          {
            message: "Please input your Last Name",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>
      <Form.Item
        name="user_name"
        label="User Name"
        rules={[
          {
            type: "text",
          },
          {
            required: true,
            message: "Please input your User Name",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>
      <Form.Item
        name="code"
        label="Code"
        rules={[
          {
            type: "text",
          },
          {
            required: true,
            message: "Please input your Code",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>
      <Form.Item
        name="address"
        label="Address"
        rules={[
          {
            type: "text",
          },
          {
            required: true,
            message: "Please input your Address",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>
      <Form.Item
        name="geolocation"
        label="Geolocation"
        rules={[
          {
            type: "text",
          },
          {
            message: "Please input your Geolocation",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>

      {/* <Form.Item
        name="email_1"
        label="E-mail-1"
        rules={[
          {
            type: "email",
            message: "The input is not valid E-mail-1!",
          },
          {
            required: true,
            message: "Please input your E-mail-1!",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item> */}

      {/* <Form.Item
        name="email_2"
        label="E-mail-2"
        rules={[
          {
            type: "email",
            message: "The input is not valid E-mail-2!",
          },
          {
            message: "Please input your E-mail-2!",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item> */}

      {/* <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            message: "Please input your password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            message: "Please confirm your password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
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
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item> */}

      <Form.Item
        name="contact_number_1"
        label="Contact Number 1"
        rules={[
          {
            message: "Please input your Contact Number 1!",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>

      <Form.Item
        name="contact_number_2"
        label="Contact Number 2"
        rules={[
          {
            required: true,
            message: "Please input your Contact Number 2!",
          },
        ]}
      >
        <Input
          style={{ border: editable ? "1px solid #d9d9d9" : "none" }}
          readOnly={editable ? false : true}
        />
      </Form.Item>

      {editable === false ? (
        <Form.Item {...tailFormItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
          >
            {editable ? "Save" : "Edit"}
          </Button>
        </Form.Item>
      ) : (
        <Form.Item {...tailFormItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
          >
            {editable ? "Save" : "Edit"}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};
export default UserProfileModal;
