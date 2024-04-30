import React, { useState, useEffect, useImperativeHandle } from 'react';
import {
  Form,
  Input,
  Table,
  Select,
  AutoComplete,
  Button,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { relative } from 'path';
import { CRUD } from './js_functions';
import { ItemBOMUrl } from './network';
// import './index.css';

const { Option } = Select;

// const ItemBomModal = ({
//   originData,
//   code,
//   rawItemData,
//   productCodes,
//   updateItemBomData,
// }) => {
const ItemBomModal = React.forwardRef((props, ref) => {
  let UOMs = useSelector((state) => state.settings.UOMs);
  let itemCategories = useSelector((state) => state.settings.itemCategories);
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  // let productCodes = useSelector((state) => state.entities.productCodes);
  const [form] = Form.useForm();
  const [data, setData] = useState(props.originData);
  const [editingKey, setEditingKey] = useState('');
  const [selectedData, setSelectedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [productCode, setProductCode] = useState([]);
  const [rawItemCodes, setRawItemCodes] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [itemBomDatas, setItemBomDatas] = useState([]);
  const [currentItemInventories, setCurrentItemInventories] = useState([]);
  console.log('rawItemData', props.rawItemData);
  console.log('itemcategoies', itemCategories);
  console.log('productcode', props.productCodes);

  const clearData = () => {
    setData([]);
    form.resetFields();
  };

  useImperativeHandle(ref, () => ({
    clearData,
  }));

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedData(selectedRows);

      console.log('selectedRows: ', selectedRows);
    },
  };

  const handleEdit = (record) => {
    // setEditingItem(record);
    // setEditId(record.id);
    // setCode(record.new_item_id);
    // form.setFieldsValue(record);
    // setIsModalVisible(true);
  };
  const handleDelete = async (record) => {
    console.log(record);
    console.log(props.rawItemData, 'before raw');
    // rawItemData.splice(rawItemData.indexOf(record), 1);
    console.log(props.rawItemData, 'after raw');
  };

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="circle"
            style={{
              color: 'white',
              background: 'green',
            }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="circle"
              style={{
                color: 'white',
                background: 'green',
              }}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
    {
      title: 'Raw Item Code',
      dataIndex: 'raw_item_code',
      key: 'raw_item_code',
    },
    {
      title: 'Name',
      dataIndex: 'raw_item_name',
      key: 'raw_item_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'net_current_qty',
      key: 'net_current_qty',
    },
    {
      title: 'Uom',
      dataIndex: 'uom_id',
      key: 'uom_id',
      render: (_, record, index) => {
        let u = UOMs.filter((item) => item.id === record.uom_id);
        return u.length > 0 ? u[0].name : '';
      },
    },
  ];

  const handleSaveRawItem = () => {
    setItemBomDatas([
      ...itemBomDatas,
      {
        raw_item_code: form.getFieldValue('raw_item_code'),
        raw_item_name: 'rawitemname',
        net_current_qty: form.getFieldValue('net_current_qty'),
        uom_id: form.getFieldValue('uom_id'),
      },
    ]);
    props.updateItemBomData({
      new_item_id: form.getFieldValue('product_code'),
      raw_item_id: form.getFieldValue('raw_item_code'),
      net_current_qty: form.getFieldValue('net_current_qty'),
      uom_id: form.getFieldValue('uom_id'),
    });

    form.setFieldsValue({
      raw_item_code: '',
      net_current_qty: '',
      uom_id: '',
    });
    // form.resetFields();
  };

  let pro_code = form.getFieldValue('product_code');

  useEffect(() => {
    (async () => {
      let res = await CRUD('get', ItemBOMUrl, null, null);
      let filteredItems = res.filter((item) => item.new_item_id === pro_code);
      console.log('filtered items ', filteredItems);
      setItemBomDatas(filteredItems);
      console.log(res, 'item res result');
    })();
  }, [pro_code]);

  useEffect(() => {
    if (pro_code) {
      let u = props.productCodes.filter((item) => item.value === pro_code);
      if (u.length > 0) {
        setRawItemCodes(u[0].raw_item_codes);
        setQuantity(u[0].quantity);
      }
    }
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     let res = await CRUD('get', EntityItemSKUUrl, null, null);
  //     console.log(res, 'item res result');
  //     setSkuNames(res.map((item) => ({ id: item.id, value: item.name })));
  //     console.log(
  //       skuNames,
  //       'sku names -------------------------------------------'
  //     );
  //   })();
  // }, [skuNames]);

  const setInitialItemdata = (code) => {
    console.log('selected product code', code);
    (async () => {
      let res = await CRUD('get', ItemBOMUrl, null, null);
      let filteredItems = res.filter((item) => item.new_item_id === code);
      console.log('filtered items ', filteredItems);
      setItemBomDatas(filteredItems);
      console.log(res, 'item res result');
    })();
  };

  console.log('product codes, +++++++++++++++++', props.productCodes);
  return (
    <>
      <Form
        form={form}
        component={false}
        initialValues={{
          new_item_id: props.code ? props.code : 'defaultCode',
        }}
      >
        <Form.Item
          name="product_code"
          label="Product Code"
          labelCol={{ span: 6 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <AutoComplete
            options={props.productCodes}
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              -1
            }
            onSelect={(value) => setInitialItemdata(value)}
          />
        </Form.Item>
        <Form.Item
          name="sku_id"
          label="SKUId"
          labelCol={{ span: 6 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select style={{ width: relative }}>
            {itemSKUs?.map((item, index) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="raw_item_code"
          label="Raw Item Code"
          labelCol={{ span: 6 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select style={{ width: relative }}>
            {props.rawItemData?.map((item, index) => (
              <Option key={item.id} value={item.value}>
                {item.value}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* <Form.Item
          name="raw_item_code"
          label="Raw Item Code"
          labelCol={{ span: 6 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <AutoComplete
            options={rawItemData}
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              -1
            }
          />
        </Form.Item> */}
        <Form.Item
          name="net_current_qty"
          label="Quantity"
          labelCol={{ span: 6 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="uom_id"
          label="UOM"
          labelCol={{ span: 6 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select style={{ width: relative }}>
            {UOMs?.map((item, index) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" onClick={handleSaveRawItem}>
          Save Raw Item
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        bordered
        dataSource={itemBomDatas}
        columns={columns}
        rowClassName="editable-row"
      />
    </>
  );
});

export default ItemBomModal;
