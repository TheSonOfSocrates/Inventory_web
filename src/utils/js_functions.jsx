/* eslint-disable default-case */
import { notification, message } from "antd";
import Axios, { AxiosResponse } from "axios";
import { tokenName } from "./data";
import { BaseUrl, SortUrl, UploadApiUrl } from "./network";

export const getAuthToken = () => {
  const accessToken = localStorage.getItem(tokenName);
  if (!accessToken) {
    return null;
  }
  return { Authorization: `Honeycomb ${accessToken}` };
};

export const logout = () => {
  localStorage.removeItem(tokenName);
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userPerm");
  localStorage.removeItem("invtToken");
  localStorage.removeItem("inactiveId");
  localStorage.removeItem("activeId");
  localStorage.removeItem("domain");

  window.location.href = "/login";
};

export const authHandler = async () => {
  try {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const response = await axiosRequest({
      url: BaseUrl + `api/EntityPerson/?user_name= ${currentUser.user_name}`,
      hasAuth: true,
      showError: true,
    });

    if (response) {
      return response.data;
    }

    return null;
  } catch (error) {
    notification.error({ title: "You are not authenticated user!" });
  }
};

export const search = async (method, url, payload, identify) => {
  let inactiveId = await JSON.parse(localStorage.getItem("inactiveId"));

  let response = await axiosRequest({
    method: method,
    url: url,
    hasAuth: true,
    payload: payload,
  });
  return response
    ? response.data.filter((item) => item.status !== inactiveId)
    : [];
};

//Getting Perms
export const getPerms = (perms) => {
  let userInfo = JSON.parse(localStorage.getItem("currentUser"));
  function extractPermProperties(obj) {
    let result = {};
    for (let key in obj) {
      if (key.startsWith("perm_")) {
        result[key] = obj[key];
      }
    }
    return result;
  }
  function mergePermissions(obj1, obj2, obj3) {
    let result = {};
    for (let key in obj1) {
      if (
        obj1.hasOwnProperty(key) &&
        obj2.hasOwnProperty(key) &&
        obj3.hasOwnProperty(key)
      ) {
        result[key] =
          obj1[key] === "1" || obj2[key] === "1" || obj3[key] === "1"
            ? "1"
            : "0";
      }
    }
    return result;
  }

  let role_1 = perms.filter((item) => item.id === userInfo.role1_id);
  let role_2 = perms.filter((item) => item.id === userInfo.role2_id);
  let role_3 = perms.filter((item) => item.id === userInfo.role3_id);

  let role1 = extractPermProperties(role_1[0]);
  let role2 = extractPermProperties(role_2[0]);
  let role3 = extractPermProperties(role_3[0]);

  return mergePermissions(role1, role2, role3);
};

//Upload
export const customRequest = async (options, tableName) => {
  const { file, onSuccess, onError } = options;
  const formData = new FormData();
  formData.append("file", file);
  const fileExtension = file.name.split(".").pop();

  try {
    const response = await fetch(UploadApiUrl, {
      method: "POST",
      body: formData,
      headers: {
        // Manually set the Content-Disposition header
        "Content-Disposition": `attachment; filename=${tableName}.${fileExtension}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const result = await response.json();

    if (response.ok) {
      message.success(`${file.name} file uploaded successfully.`);
      onSuccess(result, file);
    } else {
      message.error(`${file.name} file upload failed.`);
      onError(new Error("Upload failed."));
    }
  } catch (e) {
    message.error(`${file.name} file upload failed.`);
    onError(e);
  }
};

// CRUD for status
export const op_status = async (method, url, payload, identify) => {
  try {
    let response;
    switch (method) {
      case "post":
        response = await axiosRequest({
          method: method,
          url: url,
          hasAuth: true,
          payload: payload,
        });
        if (response) {
          notification.success({
            message: "Operation Success",
            description: "Created successfully",
          });
          return response.data;
        }
        return [];
      case "get":
        const timestamp = Date.now();
        response = await axiosRequest({
          method: method,
          url: url + `?timestamp=${timestamp}` + SortUrl,
          hasAuth: true,
          payload: payload,
        });
        return response?.data;
    }
  } catch (err) {
    return notification.error({ title: "Error" });
  }
};

// CRUD Operations
export const CRUD = async (method, url, payload, identify) => {
  // console.log(payload, 'payload');
  try {
    let currentUser = await JSON.parse(localStorage.getItem("currentUser"));
    let inactiveId = await JSON.parse(localStorage.getItem("inactiveId"));
    let response;
    switch (method) {
      case "post":
        response = await axiosRequest({
          method: method,
          url: url,
          hasAuth: true,
          payload: { ...payload, person_id_createdby: currentUser?.id },
        });
        if (response) {
          notification.success({
            message: "Operation Success",
            description: "Created successfully",
          });
          console.log(response.data, "data");
          return response.data;
        }
        return [];
      case "get":
        const timestamp = Date.now();
        console.log('when calling get the api url: ', url.includes("?") ? url + `&timestamp=${timestamp}` : url + `?timestamp=${timestamp}`)
        response = await axiosRequest({
          method: method,
          url: url.includes("?") ? url + `&timestamp=${timestamp}` : url + `?timestamp=${timestamp}`,
          hasAuth: true,
          payload: payload,
        });
        console.log("response", response)
        // return response.data.results ? response.data.results.filter((item) => item.status !== inactiveId) : response.data.filter((item) => item.status !== inactiveId) 
        return response
          ? response.data.length ? response.data.filter((item) => item.status !== inactiveId) : response.data
          : [];
      case "put":
        response = await axiosRequest({
          method: method,
          url: url + `${identify}/`,
          hasAuth: true,
          payload: { ...payload, person_id_updatedby: currentUser.id },
        });
        if (response) {
          notification.success({
            message: "Operation Success",
            description: "Updated successfully",
          });
          return response.data;
        }
        return [];
      default:
        response = await axiosRequest({
          method: method,
          url: url + `${identify}/`,
          hasAuth: true,
        });
        if (response) {
          notification.success({
            message: "Operation Success",
            description: "Deleted successfully",
          });
          return response;
        }
    }
  } catch (err) {
    console.log(err);
    return notification.error({ title: "Error" });
  }
};

export const axiosRequest = async ({
  method = "get",
  url,
  payload,
  hasAuth,
  errorObject,
  showError = true,
}) => {
  const headers = hasAuth ? getAuthToken() : {};

  const response = await Axios({
    method,
    url,
    data: payload,
    headers: {
      ...headers,
    },
  }).catch((e) => {
    if (!showError) return;
    let errorMessage = "An error occurred";
    if (e.response) {
      switch (e.response.status) {
        case 400:
          errorMessage = "Bad Request";
          break;
        case 401:
          errorMessage = "Unauthorized";
          break;
        case 402:
          errorMessage = "Payment Required";
          break;
        case 403:
          errorMessage = "Forbidden";
          break;
        case 404:
          errorMessage = "Not Found";
          break;
        default:
          errorMessage = e.response?.data.error;
      }
    }
    notification.error({
      message: errorMessage ? errorMessage : "Operation Error",
      description: errorObject?.description
        ? errorObject.description
        : e.response?.data.error,
    });

    if (e.response?.status === 401) {
      logout();
    }
  });

  if (response) {
    // console.log("AxiosResponse", response);
    return response;
  }

  return null;
};
