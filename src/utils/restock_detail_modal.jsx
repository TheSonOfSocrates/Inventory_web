// import React, { useState, useEffect, createContext, useContext, } from "react";
// import { Form, Input, InputNumber, Popconfirm, Table, Typography } from "antd";
// import { MyContext } from './context'

// const RestockDetail = ({ originData, columns }) => {
//   const [form] = Form.useForm();
//   const [data, setData] = useState([]);
//   const [editingKey, setEditingKey] = useState("");

//   const { setEditableValue } = useContext(MyContext);

//   const isEditing = (id) => id === editingKey;

//   const edit = (record) => {
//     form.setFieldsValue({ record });
//     setEditingKey(record.id);
//   };

//   const cancel = () => {
//     setEditingKey("");
//   };

//   useEffect(()=> {
//     setData(originData);
//   }, [originData, setEditableValue])

//   const save = async (key) => {
//     try {
//       const row = await form.validateFields();
//       const newData = [...data];
//       const index = newData.findIndex((item) => key === item.key);
//       if (index > -1) {
//         const item = newData[index];
//         newData.splice(index, 1, {
//           ...item,
//           ...row,
//         });
//         setData(newData);
//         setEditingKey("");
//       } else {
//         newData.push(row);
//         setData(newData);
//         setEditingKey("");
//       }
//     } catch (errInfo) {
//       console.log("Validate Failed:", errInfo);
//     }
//   };

//   const opColumns = {
//     title: "operation",
//     dataIndex: "operation",
//     render: (_, record) => {
//       const editable = isEditing(record.id);
//       console.log("record from operation", record);
//       setEditableValue(editable);
//       console.log("--------editable-------", editable)
//       return editable ? (
//         <span>
//           <Typography.Link
//             onClick={() => save(record.key)}
//             style={{
//               marginRight: 8,
//             }}
//           >
//             Save
//           </Typography.Link>
//           <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
//             <a>Cancel</a>
//           </Popconfirm>
//         </span>
//       ) : (
//         <Typography.Link
//           disabled={editingKey !== ""}
//           onClick={() => edit(record)}
//         >
//           Edit
//         </Typography.Link>
//       );
//     },
//   };

//   const updatedColumns = columns && columns.length > 0 ? [...columns] : [];
//   updatedColumns.splice(1, 0, opColumns);

//   return (
//     <Form form={form} component={false}>
//       <Table
//         bordered
//         dataSource={data}
//         columns={updatedColumns}
//         rowClassName="editable-row"
//         pagination={false}
//       />
//     </Form>
//   );
// };

// export default RestockDetail;

import React, { useState, useEffect, useContext } from "react";
import { Form, Popconfirm, Table, Typography, Input, Select } from "antd";
import { useSelector } from "react-redux";

const { Option } = Select;

const RestockDetail = ({ originData }) => {
  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let UOMs = useSelector((state) => state.settings.UOMs);
  let currencies = useSelector((state) => state.settings.currencies);
  let persons = useSelector((state) => state.entities.persons);

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");

  const edit = (record) => {
    form.setFieldsValue({ ...record }); // Spread the properties of 'record'
    setEditingKey(record.id);
  };
  const isEditing = (id) => id === editingKey;

  const cancel = () => {
    setEditingKey("");
  };

  useEffect(() => {
    setData(originData);
  }, [originData]);

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  let columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ItemSKU",
      dataIndex: "sku_id",
      key: "sku_id",
      render: (_, record, index) => {
        let res = itemSKUs?.filter((item) => item.id === record.sku_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Current Qty(regular)",
      dataIndex: "regular_net_qty_remaining",
      key: "regular_net_qty_remaining",
    },
    {
      title: "Current Qty(eaches)",
      dataIndex: "eaches_net_qty_remaining",
      key: "eaches_net_qty_remaining",
    },
    {
      title: "UOM(regular)",
      dataIndex: "regular_uom_id",
      key: "regular_uom_id",
      render: (_, record, index) => {
        let res = UOMs?.filter((item) => item.id === record.regular_uom_id);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "UOM(eaches)",
      dataIndex: "eaches_remaining_uom_id",
      key: "eaches_remaining_uom_id",
      render: (_, record, index) => {
        let res = UOMs?.filter(
          (item) => item.id === record.eaches_remaining_uom_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Restocking Level",
      dataIndex: "restocking_level",
      key: "restocking_level",
      render: (_, record, index) => {
        let res = itemSKUs?.filter(
          (item) => item.id === record.restocking_level
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "Quantity To Restock",
      dataIndex: "restock_qty",
      key: "restock_qty",
      render: (_, record, index) => {
        return isEditing(record.id) ? (
          <Form.Item name="restock_qty">
            <Input />
          </Form.Item>
        ) : record.restock_qty ? (
          record.restock_qty
        ) : (
          ""
        );
      },
    },
    {
      title: "Restocking UOM",
      dataIndex: "min_acq_currency_id",
      key: "min_acq_currency_id",
      render: (_, record, index) => {
        let res = currencies?.filter(
          (item) => item.id === record.min_acq_currency_id
        );
        return res.length > 0 ? res[0].name : "";
      },
    },
  ];

  const opColumns = {
    title: "operation",
    dataIndex: "operation",
    render: (_, record) => {
      const editable = isEditing(record.id);
      return editable ? (
        <span>
          <Typography.Link
            onClick={() => save(record.id)} // Use 'record.id' as the key
            style={{
              marginRight: 8,
            }}
          >
            Save
          </Typography.Link>
          <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
            <a>Cancel</a>
          </Popconfirm>
        </span>
      ) : (
        <Typography.Link
          disabled={editingKey !== ""}
          onClick={() => edit(record)}
        >
          Edit
        </Typography.Link>
      );
    },
  };

  const updatedColumns = columns && columns.length > 0 ? [...columns] : [];
  updatedColumns.splice(1, 0, opColumns);

  return (
    <Form form={form} component={false}>
      <Table
        bordered
        dataSource={data}
        columns={updatedColumns}
        pagination={false}
      />
    </Form>
  );
};

export default RestockDetail;
