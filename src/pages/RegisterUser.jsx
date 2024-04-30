import { useContext, useState } from "react";
import AuthComponent from "../components/AuthComponent";
import { CreateUserUrl } from "../utils/network";
import { useAuth } from "../utils/hooks";
import { useHistory } from "react-router-dom";
import { CRUD } from "../utils/js_functions";
import { store } from "../utils/store";

const RegisterUser = () => {
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
    const response = await CRUD("post", CreateUserUrl, values, null);
    if (response) {
      history.push("/login");
    }
    setLoading(false);
  };

  return (
    <AuthComponent
      titleText="Register Yourself!"
      bottonText="Submit"
      linkText="Go Back"
      isRegister={true}
      isLogin = {false}
      isForgetPassword = {false}
      linkPath="/login"
      loading={loading}
      onSubmit={onSubmit}
    />
  );
};

export default RegisterUser;
