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
  EntityItemSKUUrl,
  BaseUrl,
} from "../../../utils/network";
import { addItemSKU, updateItemSKUs } from "../../../redux/slice";

const CreateEntityItemSKU = ({ location }) => {
  const { updatingEntityItemSKU } = location?.state ?? {
    updatingEntityItemSKU: null,
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let persons = useSelector((state) => state.entities.persons);
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  

  const onFinish = async (values) => {
    const payLoad = values;
    console.log("[person create] payload ===>", payLoad);
    // return;
    try {
      let result = null;
      if (!isUpdating) {
        const selSKU = itemSKUs.find(
          (sku) => sku.code === values.code
        );
        if (selSKU) {
          notification.error({
            message: "Invalid SKU",
            description: "Pe with this user name already exists.",
          });
          return;
        }
        result = await CRUD("post", EntityItemSKUUrl, { ...values }, null);
        if (result) {
            dispatch(addItemSKU(result))
        }
      } else {
        result = await CRUD(
          "put",
          EntityItemSKUUrl,
          payLoad,
          updatingEntityItemSKU.id
        );
        if (result) {
            dispatch(updateItemSKUs(result));
        }
      }
      if (result) history.push("/itemSKU");
    } catch (error) {
      console.log("[handle create / update person error]", error);
    }
  };

  useEffect(() => {
    if (updatingEntityItemSKU) {
      setIsUpdating(true);
    } else {
      setIsUpdating(false);
    }
    if (!updatingEntityItemSKU) return;
    console.log("updatinging entity person ===>", updatingEntityItemSKU);
    // const {password, ...updatingRecord} = updatingEntityItemSKU
    form.setFieldsValue(updatingEntityItemSKU)
  }, [updatingEntityItemSKU]);

  const formFieldsList = [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "code", label: "Code", required: true },
    { type: "text", name: "brand", label: "Brand"},
    { type: "text-area", name: "description", label: "Description" },
    { type: "category-select", name: "category_id", label: "Category Id" },
    { type: "subcategory-select", name: "subcategory_id", label: "Subcategory Id" },
    { type: "type-select", name: "type_id", label: "Type Id" },
    { type: "subtype-select", name: "subtype_id", label: "Subtype Id" }, 
    
    { type: "number", name: "num_days_to_expire", label: "Num Days To Expire"},
    { type: "number", name: "num_days_trigger_before_expire", label: "Num Days Trigger Before Expire"},
    
    { type: "number", name: "restocking_level", label: "Restocking Level", required: true},
    { type: "uom-select", name: "restocking_level_uom_id", label: "Restocking Level UOM Id"},
    
    { type: "number", name: "minimum_acquisition_price", label: "Minimum Acquisition Price"},
    { type: "number", name: "minimum_acquisition_qty", label: "Minimum Acquisition QTY"},
    { type: "uom-select", name: "minimum_acquisition_uom_id", label: "Minimum Acquisition Uom Id"},
    { type: "number", name: "selling_disposition_price", label: "Selling Disposition Price"},
    { type: "number", name: "selling_disposition_qty", label: "Selling Disposition QTY"},
    { type: "uom-select", name: "selling_disposition_uom_id", label: "Selling Disposition Uom Id"},
    { type: "number", name: "selling_disposition_fix_price", label: "Selling Disposition Fix Price"},
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
              formFieldsList: formFieldsList.slice(0, 10),
            })}
          </Col>
          <Col className="gutter-row" xs={20} sm={10}>
            {renderGeneralFormFields({
              formFieldsList: formFieldsList.slice(10),
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

export default CreateEntityItemSKU;
