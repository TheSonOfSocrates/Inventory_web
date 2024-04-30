import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Form, Row, Col, Space, Button, notification } from "antd";

import PageLayout from "../../../../components/PageLayout";
import { formItemLayout } from "../../../../utils/data";
import renderGeneralFormFields from "../../../../components/generalForm/GeneralFormHelper";
import { CRUD } from "../../../../utils/js_functions";
import {
  BaseUrl,
  SettingsRolesAndPermissionsUrl,
} from "../../../../utils/network";
import { addRolesAndPermissions, updateRolesAndPermissions } from "../../../../redux/slice";

const Create = ({ location }) => {
  const { updatingRoleAndPermissions } = location?.state ?? {
    updatingRoleAndPermissions: null,
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let persons = useSelector((state) => state.entities.persons);
  let rolesAndPermissions = useSelector(
    (state) => state.settings.rolesAndPermissions
  );

  const onFinish = async (values) => {
    const payLoad = values;
    console.log("[person create] payload ===>", payLoad);
    // return;
    try {
      let result = null;
      if (!isUpdating) {
        const selRP = rolesAndPermissions.find(
          (rp) => rp.name === values.name
        );
        if (selRP) {
          notification.error({
            message: "Invalid Roles and Permissions Name",
            description: "Role and Permission with this name already exists.",
          });
          return;
        }
        result = await CRUD("post", SettingsRolesAndPermissionsUrl, { ...values }, null);
        if (result) {
            dispatch(addRolesAndPermissions(result))
        }
      } else {
        result = await CRUD(
          "put",
          SettingsRolesAndPermissionsUrl,
          payLoad,
          updatingRoleAndPermissions.id
        );
        if (result) {
            dispatch(updateRolesAndPermissions(result));
        }
      }
      if (result) history.push("/settings_roles_and_permissions");
    } catch (error) {
      console.log("[handle create / update person error]", error);
    }
  };

  useEffect(() => {
    if (updatingRoleAndPermissions) {
      setIsUpdating(true);
    } else {
      setIsUpdating(false);
    }
    if (!updatingRoleAndPermissions) return;
    console.log("updatinging entity person ===>", updatingRoleAndPermissions);
    // const {password, ...updatingRecord} = updatingRoleAndPermissions
    form.setFieldsValue(updatingRoleAndPermissions)
    // form.setFieldsValue({
    //   first_name: updatingRoleAndPermissions.first_name,
    //   middle_name: updatingRoleAndPermissions.middle_name,
    //   last_name: updatingRoleAndPermissions.last_name,
    //   user_name: updatingRoleAndPermissions.user_name,
    //   // "password": updatingRoleAndPermissions.password,
    //   code: updatingRoleAndPermissions.code,
    //   address: updatingRoleAndPermissions.address,
    //   geolocation: updatingRoleAndPermissions.geolocation,
    //   contact_number_1: updatingRoleAndPermissions.contact_number_1,
    //   contact_number_2: updatingRoleAndPermissions.contact_number_2,
    //   email_1: updatingRoleAndPermissions.email_1,
    //   email_2: updatingRoleAndPermissions.email_2,
    //   role1_id: updatingRoleAndPermissions.role1_id,
    //   role2_id: updatingRoleAndPermissions.role2_id,
    //   role3_id: updatingRoleAndPermissions.role3_id,
    //   accessCode: updatingRoleAndPermissions.accessCode,
    // });
  }, [updatingRoleAndPermissions]);

  const formFieldsList = [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text-area", name: "description", label: "Description" },
    { type: "switch", name: "perm_manage_restock", label: "PermManageRestock" },
    { type: "switch", name: "perm_create_restock", label: "PermCreateRestock" },
    { type: "switch", name: "perm_create_utilities", label: "PermCreateUtilities" },

    { type: "switch", name: "perm_create_main", label: "PermCreateMain" },
    { type: "switch", name: "perm_create_entities", label: "PermCreateEntities" },
    { type: "switch", name: "perm_create_settings", label: "PermCreateSettings" },

    { type: "switch", name: "perm_create_location", label: "PermCreateLocation" },
    { type: "switch", name: "perm_read_restock", label: "PermReadRestock" },
    { type: "switch", name: "perm_read_utilities", label: "PermReadUtilities" },

    { type: "switch", name: "perm_read_main", label: "PermReadMain" },
    { type: "switch", name: "perm_read_entities", label: "PermReadEntities" },
    { type: "switch", name: "perm_read_settings", label: "PermReadSettings" },

    { type: "switch", name: "perm_read_location", label: "PermReadLocation" },
    { type: "switch", name: "perm_update_restock", label: "PermUpdateRestock" },
    { type: "switch", name: "perm_update_utilities", label: "PermUpdateUtilities" },

    { type: "switch", name: "perm_update_main", label: "PermUpdateMain" },
    { type: "switch", name: "perm_update_entities", label: "PermUpdateEntities" },
    { type: "switch", name: "perm_update_settings", label: "PermUpdateSettings" },

    { type: "switch", name: "perm_update_location", label: "PermUpdateLocation" },
    { type: "switch", name: "perm_delete_restock", label: "PermDeleteRestock" },
    { type: "switch", name: "perm_delete_utilities", label: "PermDeleteUtilities" },

    { type: "switch", name: "perm_delete_main", label: "PermDeleteMain" },
    { type: "switch", name: "perm_delete_entities", label: "PermDeleteEntities" },
    { type: "switch", name: "perm_delete_settings", label: "PermDeleteSettings" },
    
    { type: "switch", name: "perm_delete_location", label: "PermDeleteLocation" },
    {
      type: "access-code-select",
      list: { accessCodes },
      name: "accessCode",
      label: "AccessCode",
    },
  ];

  return (
    <PageLayout title="Create / Update Entity Company">
      <Form
        className="create-entity-company-form"
        {...formItemLayout}
        form={form}
        name="CreateEntityCompanyForm"
        onFinish={onFinish}
        // initialValues={formIntialValues}
      >
        <Row gutter={[48, 32]}>
          {/* <Col span={2}></Col> */}
          <Col className="gutter-row" xs={24} sm={8}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(0, 9),
            })}
          </Col>
          <Col className="gutter-row" xs={24} sm={8}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(9, 19),
            })}
          </Col>
          <Col className="gutter-row" xs={24} sm={8}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(19),
            })}
          </Col>
          {/* <Col span={2}></Col> */}
        </Row>
        <Form.Item
          colon={false}
          wrapperCol={{ span: 12, offset: 6 }}
          className="form-actions"
          style={{textAlign: 'center'}}
        >
          <Space>
            <Button type="primary" htmlType="submit">
              {isUpdating ? "Update" : "Create"}
            </Button>
            <Button htmlType="reset">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </PageLayout>
  );
};

export default Create;
