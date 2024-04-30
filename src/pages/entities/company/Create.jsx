import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Form, Row, Col, Space, Button, notification } from "antd";

import GeneralForm from "../../../components/generalForm/GeneralForm";
import PageLayout from "../../../components/PageLayout";
import { formItemLayout } from "../../../utils/data";
import renderGeneralFormFields from "../../../components/generalForm/GeneralFormHelper";
import { CRUD } from "../../../utils/js_functions";
import {
  CreateUserUrl,
  EntityCompanyUrl,
  BaseUrl,
} from "../../../utils/network";
import { addCompany, updateCompanies } from "../../../redux/slice";

const CreateEntityCompany = ({ location }) => {
  const { updatingEntityCompany } = location?.state ?? {
    updatingEntityCompany: null,
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
        const selPerson = persons.find(
          (person) => person.user_name === values.user_name
        );
        if (selPerson) {
          notification.error({
            message: "Invalid Username",
            description: "Company with this company name already exists.",
          });
          return;
        }
        result = await CRUD("post", EntityCompanyUrl, { ...values }, null);
        if (result) {
            dispatch(addCompany(result))
        }
      } else {
        result = await CRUD(
          "put",
          EntityCompanyUrl,
          payLoad,
          updatingEntityCompany.id
        );
        if (result) {
            dispatch(updateCompanies(result));
        }
      }
      if (result) history.push("/companies");
    } catch (error) {
      console.log("[handle create / update person error]", error);
    }
  };

  useEffect(() => {
    if (updatingEntityCompany) {
      setIsUpdating(true);
    } else {
      setIsUpdating(false);
    }
    if (!updatingEntityCompany) return;
    console.log("updatinging entity person ===>", updatingEntityCompany);
    // const {password, ...updatingRecord} = updatingEntityCompany
    form.setFieldsValue(updatingEntityCompany)
    // form.setFieldsValue({
    //   first_name: updatingEntityCompany.first_name,
    //   middle_name: updatingEntityCompany.middle_name,
    //   last_name: updatingEntityCompany.last_name,
    //   user_name: updatingEntityCompany.user_name,
    //   // "password": updatingEntityCompany.password,
    //   code: updatingEntityCompany.code,
    //   address: updatingEntityCompany.address,
    //   geolocation: updatingEntityCompany.geolocation,
    //   contact_number_1: updatingEntityCompany.contact_number_1,
    //   contact_number_2: updatingEntityCompany.contact_number_2,
    //   email_1: updatingEntityCompany.email_1,
    //   email_2: updatingEntityCompany.email_2,
    //   role1_id: updatingEntityCompany.role1_id,
    //   role2_id: updatingEntityCompany.role2_id,
    //   role3_id: updatingEntityCompany.role3_id,
    //   accessCode: updatingEntityCompany.accessCode,
    // });
  }, [updatingEntityCompany]);

  const formFieldsList = [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "code", label: "Code", required: true },
    { type: "text-area", name: "description", label: "Description" },
    { type: "text", name: "address", label: "Address" },
    { type: "text", name: "geolocation", label: "Geolocation" },
    {
      type: "phone",
      name: "contact_number_1",
      label: "Contact Number 1",
      required: true,
    },
    { type: "phone", name: "contact_number_2", label: "Contact Number 2" },
    { type: "email", name: "email_1", label: "Email 1", required: true },
    { type: "email", name: "email_2", label: "Email 2" },
    {
      type: "person-select",
      list: { persons },
      name: "contact_person_1",
      label: "Contact Person 1",
    },
    {
      type: "person-select",
      list: { persons },
      name: "contact_person_2",
      label: "Contact Person 2",
    },
    {
      type: "role-select",
      list: { rolesAndPermissions },
      name: "role1_id",
      label: "Role 1",
    },
    {
      type: "role-select",
      list: { rolesAndPermissions },
      name: "role2_id",
      label: "Role 2",
    },
    {
      type: "role-select",
      list: { rolesAndPermissions },
      name: "role3_id",
      label: "Role 3",
    },
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
          <Col span={2}></Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(0, 7),
            })}
          </Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(7),
            })}
          </Col>
          <Col span={2}></Col>
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

export default CreateEntityCompany;
