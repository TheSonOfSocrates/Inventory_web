import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Table,
  Button,
  Form,
  Input,
  Spin,
  Select,
  Popconfirm,
  Row
  // Icon,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  CurrentItemInventoryUrl,
  ItemBOMUrl,
} from '../../../utils/network';
import { CRUD } from '../../../utils/js_functions';
import { useDispatch, useSelector } from 'react-redux';
import { convertToNumber } from '../../../utils/numberHelper';
import { itemInventoryListReceived } from '../../../redux/itemInventorySlice';

const { Option } = Select;

const MAX_QTY = 10000000;
const ActionType = {
  NEW: 'new',
  ADD: 'add',
  EXIST: 'exist',
  UPDATE: 'update',
  DELETE:  'delete'
}

const initialActiveRawItem = {
  id: '',
  product_code: '',
  raw_item_id: '',
  raw_item_code: '',
  raw_item_name: '',
  quantity: '',
  uom_id: '',
  uom_name: '',
  max_quantity: MAX_QTY,
  action_type: ActionType.NEW
}
const CreateItemBom = ({location}) => {
  let user = JSON.parse(localStorage.getItem('currentUser'));
  // ref user.accessCode
  const { product_code, backUrl} = location?.state ?? {product_code: '', backUrl: ''};
  const isNew = product_code ? false : true;
  console.log("product code ====> ", product_code);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [currentItemInventories, setCurrentItemInventories] = useState([]);
  const [productCode, setProductCode] = useState(product_code);
  const [loading, setLoading] = useState(false);
  const [rawItemList, setRawItemList] = useState([]);
  const [assemblyItemList, setAssemblyItemList] = useState([]);
  const [rawItemBomList, setRawItemBomList] = useState([]);
  const [activeRawItem, setActiveRawItem] = useState(initialActiveRawItem);
  const [isDeleteProduct, setIsDeleteProduct] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { setFieldsValue, resetFields } = form;

  let UOMs = useSelector((state) => state.settings.UOMs);
  let itemInventoryList = useSelector(
    (state) => state.itemInventory.itemInventoryList
  );
  let itemCategories = useSelector((state) => state.settings.itemCategories);
  let itemTypes = useSelector((state) => state.settings.itemTypes);
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let userPerm = JSON.parse(localStorage.getItem('userPerm'));
  // let productCodes = useSelector((state) => state.entities.productCodes);
  
  useEffect(()=> {
    if (productCode !== '') {
      const selectedAssemblyItem = itemInventoryList.find(it => it.code === productCode);
      const selectedSku = itemSKUs.find(it => it.id === selectedAssemblyItem?.sku_id);
      setFieldsValue({
        sku_name: selectedSku?.name ?? '',
        product_code: productCode
      }) 
      fetchItemBomData(productCode);
    }
  }, [productCode])
  
  useEffect (() =>{
    const rawCategory = itemCategories.find(it => it.name === 'raw');
    const assemblyType = itemTypes.find(it => it.name === 'assembly');
    const _rawItemList = itemInventoryList.filter(it => it.category_id === rawCategory?.id && (it.accessCode === user.accessCode || null));
          
    const _assemblyItemList = itemInventoryList.filter(it => it.type_id === assemblyType?.id && (it.accessCode === user.accessCode || null));
    setRawItemList(_rawItemList)
    setAssemblyItemList(_assemblyItemList);
  }, [itemInventoryList])

  const fetchItemBomData = async (code) => {
    try {
      setLoading(true);
      const res = await CRUD('get', ItemBOMUrl + '?code=' + code, null, null);
      const resItemInventory = await CRUD('get', CurrentItemInventoryUrl, null, null);
      dispatch(itemInventoryListReceived(resItemInventory))
      const postProcessedData = postProcess(res);
      setRawItemBomList(postProcessedData);
      setLoading(false);
    } catch (error) {
      console.log('=====> error', JSON.stringify(error))
      setLoading(false);
    }
  }

  const postProcess = (data) => {
    let processedList = [];
    data.map(datum => {
      const _itemBom = itemInventoryList.find(it=> it.id === datum.raw_item_id);
      const _uom = UOMs.find(it => it.id === datum.uom_id);
      processedList.push({
        id: datum.id,
        raw_item_id: datum.raw_item_id,
        raw_item_code: _itemBom?.code ?? '',
        raw_item_name: _itemBom?.name ?? '',
        prev_quantity: convertToNumber(datum.net_current_qty),
        quantity: convertToNumber(datum.net_current_qty),
        uom_id: datum.uom_id,
        uom_name: _uom?.name ?? '',
        action_type: ActionType.EXIST
      })
    })
    return processedList;
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log('selectedRows: ', selectedRows);
    },
  };

  const handleEdit = (record) => {
    console.log('[handle Edit] record ===> ', record);
    setActiveRawItem({
      ...record,
      action_type: (record.action_type === ActionType.EXIST || record.action_type === ActionType.UPDATE) ? ActionType.UPDATE : ActionType.ADD
    });

    setFieldsValue({
      raw_item_id: record.raw_item_id,
      raw_item_code: record.raw_item_code,
      raw_item_name: record.raw_item_name,
      quantity: convertToNumber(record.quantity),
      uom_id: record.uom_id,
      uom_name: record.uom_name,
    })
  };

  const handleDelete = (record) => {
    let updatedRawItemList = [];
    
    if (record.action_type === ActionType.EXIST || record.action_type === ActionType.UPDATE) {
      updatedRawItemList= rawItemBomList.map((item) => {
       return (
         item.raw_item_id === record.raw_item_id 
         ? {...item, action_type: ActionType.DELETE}
         : item
       )
      });      
    } else {
      // (record.action_type === ActionType.ADD)
      updatedRawItemList= rawItemBomList.filter((item) => 
        item.raw_item_code !== record.raw_item_code
      );
    }
    let isDeleteFlag = updatedRawItemList.findIndex(it => it.action_type !== ActionType.DELETE);
    
    setActiveRawItem(initialActiveRawItem)
    setRawItemBomList(updatedRawItemList);
  };

  const checkDeleteProuct = () => {
    let flag = rawItemBomList.findIndex(it => it.action_type !== ActionType.DELETE);
    if (flag === -1) return true;
    return false;
  }
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
      render: (_, record, index) => {
        return record.raw_item_code
      }

    },
    {
      title: 'Raw Item Name',
      dataIndex: 'raw_item_name',
      key: 'raw_item_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'net_current_qty',
      key: 'net_current_qty',
      render: (_, record, index) => {
        return record.quantity;
      }
    },
    {
      title: 'Uom',
      dataIndex: 'uom_id',
      key: 'uom_id',
      render: (_, record, index) => {
        return record.uom_name;
      },
    },
  ];
  // For Form Setting
  const layout = {
    labelCol: {span:6},
    wrapperCol: {span: 12}
  }
  
  const tailLayout = {
    wrapperCol: { offset: 10, span: 14}
  }

  const validateNumber = (_, value,  maxValue) => {
    if (isNaN(value) || convertToNumber(value) === 0) {
      return Promise.reject(`Please enter a valid number`)
    } else if ( convertToNumber(value) > maxValue) {
      return Promise.reject(`Please enter a valid number. Max value is ${maxValue}`)
    }
    return Promise.resolve();
  };

  const fields= [
    {name: "product_code", type: 'select', required: true, errorMsg: 'Select the Product Code', placeholder: 'Product Code'},
    {name: "sku_name", type: 'input', required: false, readOnly: true, type: 'input'},
    {name: "raw_item_code", type: 'select', required: true, errorMsg: 'Select the Raw Item Code', placeholder: 'Raw Item Code'},
  ]

  const onAddUpdate = (values) => {
    console.log('values====>', values, activeRawItem)
    switch (activeRawItem.action_type){
      case ActionType.NEW: 
      {
        // add new item
        const newRawItem = {
          id: '',
          raw_item_id: values.raw_item_id,
          raw_item_code: values.raw_item_code,
          raw_item_name: values.raw_item_name,
          quantity: convertToNumber(values.quantity),
          uom_id: values.uom_id,
          uom_name: values.uom_name,
          action_type: ActionType.ADD
        };
        setRawItemBomList([...rawItemBomList, newRawItem]);
        break;
      }
      case ActionType.ADD:
      {
        // update newly added item
        const updatedRawItemList = rawItemBomList.map((item) => {
          return (
            item.raw_item_id === values.raw_item_id 
            ? {...item, quantity: convertToNumber(values.quantity), action_type: ActionType.ADD}
            : item
          )
        });
        setRawItemBomList(updatedRawItemList);
        break;
      }
      case ActionType.EXIST:
      {
        // update existed item
        const updatedRawItemList = rawItemBomList.map((item) => {
          return (
            item.raw_item_id === values.raw_item_id 
            ? {...item, quantity: convertToNumber(values.quantity), action_type: ActionType.UPDATE}
            : item
          )
        });
        setRawItemBomList(updatedRawItemList);
        break;
      }
      case ActionType.UPDATE:
      {
        // update already updated exsited item 
        const updatedRawItemList = rawItemBomList.map((item) => {
          return (
            item.raw_item_id === values.raw_item_id 
            ? {...item, quantity: convertToNumber(values.quantity), action_type: ActionType.UPDATE}
            : item
          )
        });
        setRawItemBomList(updatedRawItemList);
        break;
      }
      case ActionType.DELETE:
      {
        // update already updated exsited item 
        const updatedRawItemList = rawItemBomList.map((item) => {
          return (
            item.raw_item_id === values.raw_item_id 
            ? {...item, quantity: 0, action_type: ActionType.UPDATE}
            : item
          )
        });
        setRawItemBomList(updatedRawItemList);
        break;
      }
      default: 
      {
        console.warn('>>>>>>>>>>>>>>>>> default switch action')
        break;
      }
    }
    setActiveRawItem(initialActiveRawItem);
    form.resetFields(["quantity", 'raw_item_code', "uom_name"])
  }
  
  const onReset = () => {
    form.resetFields();
  }
  
  const onFill = () => {
    form.setFieldsValue({
      note: 'Hello world!',
      gender: 'male',
    });
  };

  const onProductCodeChange = (value) => {
    const selectedAssemblyItem = assemblyItemList.find(it => it.code === value);
    const selectedSku = itemSKUs.find(it => it.id === selectedAssemblyItem.sku_id);
    setActiveRawItem({...activeRawItem, product_code: value})
    resetAll();
    setProductCode(value);
    setFieldsValue({sku_name: selectedSku?.name ?? ''})
  }

  const onRawItemCodeChange = (value) => {

    const selectedRawItem = rawItemList.find(it => it.code === value);
    const _itemBOM = rawItemBomList.find(it => it.raw_item_code === value);
    let uom_id = '';
    let remaining_qty = 0;
    if (selectedRawItem?.regular_uom_id) {
      uom_id = selectedRawItem.regular_uom_id;
      remaining_qty = selectedRawItem?.regular_net_qty_remaining ?? 0
    } else if (selectedRawItem?.eaches_remaining_uom_id) {
      uom_id = selectedRawItem?.eaches_remaining_uom_id;
      remaining_qty = selectedRawItem?.eaches_net_qty_remaining ?? 0
    } 
    const selectedUOM = UOMs.find(it => it.id === uom_id );
    // in the case that the value (selected raw item code) is alrady in the rawItemBomList
    console.log('remaining ====>', remaining_qty);
    setActiveRawItem({...activeRawItem, action_type: _itemBOM?.action_type ?? ActionType.NEW, max_quantity: remaining_qty})
    setFieldsValue({
      quantity: convertToNumber(_itemBOM?.quantity),
      raw_item_code: value,
      raw_item_id: selectedRawItem.id,
      raw_item_name: selectedRawItem.name,
      uom_name: selectedUOM?.name ?? '',
      uom_id: selectedUOM.id
    });
  }

  const getPutPayload = (rawItem, itemBom) => {
    let fieldName = 'regular_net_qty_remaining';
    let rawQuantity = convertToNumber(rawItem.regular_net_qty_remaining)

    if (rawItem.eaches_remaining_uom_id === itemBom.raw_item_id) {
      fieldName = 'eaches_net_qty_remaining';
      rawQuantity = convertToNumber(rawItem.eaches_net_qty_remaining);
    }
    let bomQuantity = convertToNumber(itemBom.quantity)
    let prev_bomQuantity =convertToNumber(itemBom.prev_quantity)
    console.log('fieldName, rawQuantity', fieldName, itemBom.action_type, "3 values", rawQuantity, bomQuantity, prev_bomQuantity)

    switch (itemBom.action_type) {
      case ActionType.ADD:
        return {
          [fieldName]: rawQuantity - bomQuantity
        }
      case ActionType.UPDATE:
        return {
          [fieldName]: rawQuantity + prev_bomQuantity - bomQuantity
        }
      case ActionType.DELETE: {
        return {
          [fieldName]: rawQuantity + prev_bomQuantity            
        }
      }
      default:
        return null
    }
  }
  const handleSaveTableContent = async () => {
    let apiPromises = []
    try {
      rawItemBomList.map((item) => {
        const _rawItem = rawItemList.find(it=>it.id === item.raw_item_id);
        const putPayload = getPutPayload(_rawItem, item)
        // console.log('putLayload ====> ', putPayload)
        if (putPayload) {
          apiPromises.push((CRUD("put", CurrentItemInventoryUrl, putPayload, item.raw_item_id)))  
          const _rawItemList = rawItemList.map(it => it.id == item.raw_item_id ? 
            {...it, ...putPayload} : it
          )
          setRawItemList(_rawItemList);
        }

        switch(item.action_type){
          case ActionType.ADD :
          {
            const PostPayload = {
              code: productCode,
              net_current_qty: item.quantity,
              raw_item_id: item.raw_item_id,
              uom_id: item.uom_id,
            } 
            apiPromises.push(CRUD("post", ItemBOMUrl, PostPayload, null));
            break;
          }
          case ActionType.UPDATE: 
          {
            const payload = {
              net_current_qty: item.quantity,
            }
            apiPromises.push(CRUD("put", ItemBOMUrl, payload, item.id));
            break;
          }
          case ActionType.DELETE:
          {
            apiPromises.push(CRUD("delete", ItemBOMUrl, null, item.id));
            break;
          }
        }
      })
      if(checkDeleteProuct()) {
        const selectedProduct = itemInventoryList.find(it => it.code === productCode);
        if (selectedProduct) apiPromises.push(CRUD('delete', CurrentItemInventoryUrl, null, selectedProduct.id))
      }
      const apiResponses = await Promise.all(apiPromises);
      console.log('********* api Responses ***********', apiResponses);      
      resetAll();
      history.push('/itemBOM')
    } catch (error) {
      console.error('An error occurred:', error);
    }

  }
  const resetAll = () => {
    setActiveRawItem(initialActiveRawItem);
    setProductCode('');
    setRawItemBomList([]);
    setFieldsValue({
      product_code: '',
      sku_name: '',
      quantity: '',
      raw_item_code: '',
      uom_name: ''
    })
  }

  return (
    <>
    {loading ? (
      <Spin size="large" />
    ) : (
      <div>
        <Row style={{marginBottom: '32px'}}>
          <span
            style={{
              color: 'green',
              fontSize: 20,
              fontFamily: 'cursive',
            }}
          >
            Create/Update Item BOM/Assembly
          </span>

        </Row>
        <Form {...layout} form={form} name="control-hooks" onFinish={onAddUpdate} style={{marginTop: '24px'}}>
          <Form.Item name="product_code" label="Product code" rules={[{ required: true}]}>
            <Select showSearch placeholder="Select an product code" onChange={onProductCodeChange} disabled = {!isNew}
            //  optionFilterProp="children"
            //  filterOption={(input, option) =>
            //    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            //  }
            >
              { assemblyItemList.map(assItem => 
                <Option value={assItem.code} key={assItem.code}> {assItem.code} </Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="sku_name" label="SKU">
            <Input readOnly/>
          </Form.Item>
          {/* raw item setting */}
          <Form.Item name="raw_item_code" label="Raw Item Code" rules ={[{required: true}]}>
            <Select showSearch placeholder="Select an option" onChange={onRawItemCodeChange}>
              {rawItemList.map(rawItem => 
                <Option value={rawItem.code}> { rawItem.code} </Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="raw_item_id" style={{height: 0, margin: 0}}>
            <Input hidden/>
          </Form.Item>
          <Form.Item name="raw_item_name" style={{height: 0, margin: 0}}>
            <Input hidden/>
          </Form.Item>

          <Form.Item name='quantity' label="Quantity" rules={[{required: true}, 
            {validator: (_, value) => validateNumber(_, value, activeRawItem.max_quantity), 
            message: 'Please enter a valid number'}
            ]}>
            <Input type="number" min={0}/>
          </Form.Item>
          <Form.Item name='uom_name' label="UOM" rules={[{required: true}]}>
            <Input type="text" readOnly/>
          </Form.Item>
          <Form.Item name="uom_id" style={{height: 0, margin: 0}}>
            <Input hidden/>
          </Form.Item>

          {/* Actions buttons */}
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" style={{width: '200px'}}>
              {activeRawItem.action_type === ActionType.NEW ? 'Add': 'Update'}
            </Button>
            {/* <Button htmlType="button" onClick={onReset}>
              Reset
            </Button> */}
            {/* <Button type="link" htmlType="button" onClick={onFill}>
              Fill form
            </Button> */}
          </Form.Item>
        </Form>  
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
      </div>
      <Table
        rowSelection={rowSelection}
        bordered
        dataSource={rawItemBomList.filter(it=>it.action_type !== ActionType.DELETE)}
        // dataSource={rawItemBomList}
        columns={columns}
        rowClassName="editable-row"
        title={()=>
        <Row justify="end">
          <Button type="primary" onClick = {handleSaveTableContent} style={{width: '200px'}}>
              {checkDeleteProuct() ? 'Delete' : 'Save' }
          </Button>
        </Row>            
        }
      />
      </div>
    )}
  </>
  );
};

export default CreateItemBom;