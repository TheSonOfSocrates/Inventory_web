import { useContext, useState } from "react";
import AuthComponent from "../components/AuthComponent";
import { CreateUserUrl, ForgetPasswordUrl } from "../utils/network";
import { useAuth } from "../utils/hooks";
import { useHistory } from "react-router-dom";
import { CRUD } from "../utils/js_functions";
import { store } from "../utils/store";

const ForgetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(store);

  const history = useHistory();

  useAuth({
    successCallBack: () => {
      history.push("/");
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    const response = await CRUD("post", ForgetPasswordUrl, values, null);
    if (response) {
      history.push("/login");
    }
    setLoading(false);
  };

  return (
    <AuthComponent
      titleText="Reset your password using email!"
      bottonText="Submit"
      linkText="Go Back"
      isRegister={false}
      isLogin = {false}
      isForgetPassword = {true}
      linkPath="/login"
      loading={loading}
      onSubmit={onSubmit}
    />
  );
};

export default ForgetPassword;
