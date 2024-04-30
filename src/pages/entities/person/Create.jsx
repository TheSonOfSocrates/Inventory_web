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
  EntityPersonUrl,
  CreateUserUrl,
  BaseUrl,
} from "../../../utils/network";
import { addPerson, updatePersons } from "../../../redux/slice";

const CreateEntityPerson = ({ location }) => {
  const { updatingEntityPerson } = location?.state ?? {
    updatingEntityPerson: null,
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
            description: "Person with this user name already exists.",
          });
          return;
        }
        result = await CRUD("post", CreateUserUrl, { ...values }, null);
        if (result) {
            dispatch(addPerson(result))
        }
      } else {
        result = await CRUD(
          "put",
          EntityPersonUrl,
          payLoad,
          updatingEntityPerson.id
        );
        if (result) {
            dispatch(updatePersons(result));
        }
      }
      if (result) history.push("/persons");
    } catch (error) {
      console.log("[handle create / update person error]", error);
    }
  };

  useEffect(() => {
    if (updatingEntityPerson) {
      setIsUpdating(true);
    } else {
      setIsUpdating(false);
    }
    if (!updatingEntityPerson) return;
    console.log("updatinging entity person ===>", updatingEntityPerson);
    const {password, ...updatingRecord} = updatingEntityPerson
    form.setFieldsValue(updatingRecord)
    // form.setFieldsValue({
    //   first_name: updatingEntityPerson.first_name,
    //   middle_name: updatingEntityPerson.middle_name,
    //   last_name: updatingEntityPerson.last_name,
    //   user_name: updatingEntityPerson.user_name,
    //   // "password": updatingEntityPerson.password,
    //   code: updatingEntityPerson.code,
    //   address: updatingEntityPerson.address,
    //   geolocation: updatingEntityPerson.geolocation,
    //   contact_number_1: updatingEntityPerson.contact_number_1,
    //   contact_number_2: updatingEntityPerson.contact_number_2,
    //   email_1: updatingEntityPerson.email_1,
    //   email_2: updatingEntityPerson.email_2,
    //   role1_id: updatingEntityPerson.role1_id,
    //   role2_id: updatingEntityPerson.role2_id,
    //   role3_id: updatingEntityPerson.role3_id,
    //   accessCode: updatingEntityPerson.accessCode,
    // });
  }, [updatingEntityPerson]);

  const formFieldsList = [
    { type: "text", name: "first_name", label: "First Name", required: true },
    { type: "text", name: "middle_name", label: "Middle Name" },
    { type: "text", name: "last_name", label: "Last Name", required: true },
    { type: "text", name: "user_name", label: "User Name", required: true },
    {
      type: "password",
      name: "password",
      label: "password",
      required: true,
    },
    { type: "text", name: "code", label: "Code", required: true },
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
    <PageLayout title="Create / Update Entity Person">
      <Form
        className="create-entity-person-form"
        {...formItemLayout}
        form={form}
        name="CreateEntityPersonForm"
        onFinish={onFinish}
        // initialValues={formIntialValues}
      >
        <Row gutter={[48, 32]}>
          <Col span={2}></Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(0, 8),
            })}
          </Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(8),
            })}
          </Col>
          <Col span={2}></Col>
        </Row>
        <Form.Item
          colon={false}
          wrapperCol={{ span: 12, offset: 6 }}
          className="form-actions"
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

export default CreateEntityPerson;
