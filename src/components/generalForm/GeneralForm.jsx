import React from 'react';
import { Form, Input, Button, Select } from 'antd';

const { Option } = Select;

const GeneralForm = ({ fields }) => {
  const [form] = Form.useForm();

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form:', values);
      } else {
        console.error('Form validation failed:', err);
      }
    });
  };

  const renderFormItems = () => {
    return fields.map(field => (
      <Form.Item key={field.name} label={field.label} name={field.name} rules={field.rules}>
        {field.type === 'select' ? (
          <Select showSearch placeholder={field.placeholder}>
            {field.options.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        ) : (
          <Input placeholder={field.placeholder} />
        )}
      </Form.Item>
    ));
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      {renderFormItems()}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default GeneralForm;