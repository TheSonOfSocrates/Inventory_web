import { useState } from "react";
import AuthComponent from "../components/AuthComponent";
import { tokenName } from "../utils/data";
import {
  LoginUrl,
  BaseUrl,
  SettingsStatusUrl,
  EntityPersonUrl,
} from "../utils/network";
import { useHistory } from "react-router-dom";
import { axiosRequest } from "../utils/functions";
import { CRUD, search, op_status } from "../utils/js_functions";
import { useDispatch } from "react-redux";
import { getActiveId } from "../redux/slice";

const Login = () => {
  const disptach = useDispatch();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // useAuth({
  //   errorCallBack: () => {
  //     logout();
  //   },
  //     successCallBack: () => {
  //         history.push("/")
  //     }
  // })
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const onSubmit = async (values) => {
    setLoading(true);
    console.log("----values from form of login------", values);
    localStorage.setItem("domain", JSON.stringify(values.url));
    let baseUrl = localStorage.getItem("domain");
    await axiosRequest({
      method: "post",
      url: `${values.url}/honeycomb/api/token/`,
      payload: values,
      errorObject: {
        message: "Login Error",
      },
    }).then(async (resToken) => {
      console.log("---resToken----", resToken);
      console.log("---baseUrl----", baseUrl);

      localStorage.setItem(tokenName, resToken.data.refresh);
      let resStatus = await op_status(
        "get",
        `${values.url}/honeycomb/api/SettingsStatus/`,
        null,
        null
      );
      let inActiveItem = await resStatus?.filter(
        (item) => item.name === "inactive"
      );
      let activeItem = await resStatus.filter((item) => item.name === "active");

      localStorage.setItem("inactiveId", JSON.stringify(inActiveItem[0].id));
      localStorage.setItem("activeId", JSON.stringify(activeItem[0].id));

      const timestamp = Date.now();

      const SearchUrl = `${values.url}/honeycomb/api/EntityPerson/?timestamp=${timestamp}&search=${values.user_name}`;
      
      let res = await search("get", SearchUrl, null, null);

      console.log("response UserPermission =====> ", res);

      localStorage.setItem("currentUser", JSON.stringify(res[0]));

      history.push("/");
    });
    setLoading(false);
  };

  return <AuthComponent onSubmit={onSubmit} loading={loading} link2Text="Forgot Password?" link2Path="/forgot-password" />;
};

export default Login;
