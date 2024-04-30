import { FC } from "react";
import { Form, Input, Button } from "antd";
import { Link } from "react-router-dom";
import { DataProps } from "../utils/types";

interface AuthComponentProps {
  titleText?: string;
  isRegister?: boolean;
  isLogin?: boolean;
  isForgetPassword?: boolean;
  bottonText?: string;
  linkText?: string;
  link2Text?: string;
  linkPath?: string;
  link2Path?: string;
  onSubmit: (values: DataProps) => void;
  loading?: boolean;
  isUpdatePassword?: boolean;
}

const AuthComponent: FC<AuthComponentProps> = ({
  titleText = "Sign In",
  isRegister = false,
  isLogin = true,
  isForgetPassword = false,
  bottonText = "Login",
  linkText = "New User?",
  linkPath = "/register_user",
  link2Text = "",
  link2Path = "",
  onSubmit,
  loading = false,
  isUpdatePassword = false,
}) => {
  return (
    <div className="login">
      <div className="inner">
        <div className="header">
          <h3>{titleText}</h3>
          <h2>VGIS</h2>
        </div>

        <Form layout="vertical" onFinish={onSubmit}>
          {isLogin && (
            <>
              <Form.Item
                label="Username"
                name="user_name"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input placeholder="Kevin" type="name" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input placeholder="Password" type="password" />
              </Form.Item>
              <Form.Item
                label="Domain"
                name="url"
                rules={[
                  { required: true, message: "Please input a URL!"},
                ]}
              >
                <Input placeholder="http://<ip_or_domain:89/>" type="name" />
              </Form.Item>
            </>
          )}
          {isRegister && (
            <>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[
                  {
                    message: "Please input your First Name",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="middle_name"
                label="Middle Name"
                rules={[
                  {
                    message: "Please input your Middle Name",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[
                  {
                    message: "Please input your Last Name",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="user_name"
                label="User Name"
                rules={[
                  {
                    required: true,
                    message: "Please input your User Name",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="code"
                label="Code"
                rules={[
                  {
                    required: true,
                    message: "Please input your Code",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
                rules={[
                  {
                    required: true,
                    message: "Please input your Address",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="geolocation"
                label="Geolocation"
                rules={[
                  {
                    message: "Please input your Geolocation",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
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
                <Input />
              </Form.Item>

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
                <Input.Password />
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
                        new Error(
                          "The new password that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
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
                <Input />
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
                <Input />
              </Form.Item>
            </>
          )}
          {isForgetPassword && (
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email address!",
                },
              ]}
            >
              <Input placeholder="Email Address" type="text" />
            </Form.Item>
          )}
          <Form.Item>
            <Button htmlType="submit" type="primary" block loading={loading}>
              {bottonText}
            </Button>
          </Form.Item>
        </Form>
        <Link to={linkPath}>{linkText}</Link>
        <br />
        <Link to={link2Path}>{link2Text}</Link>
      </div>
    </div>
  );
};

export default AuthComponent;
