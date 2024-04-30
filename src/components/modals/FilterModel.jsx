import { Col, Form, Row, Select } from "antd";
import { Option } from "antd/es/mentions";

const FilterModel = ({ setFilter, formItems }) => {
  const filterOption = (inputValue, option) => {
    return option.children.toLowerCase().includes(inputValue.toLowerCase());
  };

  const handleOnSelect = (val, key) => {
    setFilter((previousState) => {
      return { ...previousState, [key]: val };
    });
  };

  return (
    <Form layout="vertical">
      <Row gutter={[16, 16]}>
        {formItems?.map((item, index) => (
          <Col key={index} xs={24} sm={24} md={12} lg={8} xl={6}>
            <Form.Item colon={false} label={item?.label} name={item?.name}>
              <Select showSearch onChange={(val) => handleOnSelect(val, item?.name)} filterOption={filterOption} defaultValue="">
                <Option value="">All</Option>
                {item?.data?.map((dataItem) => (
                  <Option key={dataItem?.id} value={dataItem?.id}>
                    {dataItem?.name || dataItem?.user_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        ))}
      </Row>
    </Form>
  );
};

export default FilterModel;
