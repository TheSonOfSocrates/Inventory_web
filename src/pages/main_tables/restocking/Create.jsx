import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  Button,
  Select,
  Row,
  notification,
} from "antd";
import {
  DeleteOutlined,
  SaveOutlined,
  SaveTwoTone,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

import RequestRestockModal from "../../../components/modals/RequestStockModal";
import { CRUD } from "../../../utils/js_functions";
import { RestockDetailsUrl, RestockSummaryUrl } from "../../../utils/network";
import { getPerms } from "../../../utils/js_functions";
import { isExpired, comparebyUpdatedDateTime } from "../../../utils/dateHelper";
import { convertToNumber } from "../../../utils/numberHelper";

const EditableContext = React.createContext(null);
const { Option } = Select;
const { Title } = Typography;

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const CreateRestock = ({ location }) => {
  const { updatingRestockDetails, updatingSummary } = location?.state ?? {
    updatingRestockDetails: [],
    updatingSummary: null,
  };
  // console.log(
  //   "[create restock ]location information ===> ",
  //   updatingRestockDetails,
  //   updatingSummary
  // );

  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let perms = useSelector((state) => state.settings.rolesAndPermissions);
  let currentUserPerms = getPerms(perms);

  const [restockItemList, setRestockItemList] = useState([]);
  const [selectedRestockItemList, setSelectedRestockItemList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [inventoryListGroupBySku, setInventoryListGroupBySku] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [initialValuesForModalForm, setInitialValuesForModalForm] = useState({
    cost_center_id: "",
    generic_code: "",
  });

  const [form] = Form.useForm();
  const history = useHistory();

  let itemSKUs = useSelector((state) => state.entities.itemSKUs);
  let itemInventoryList = useSelector(
    (state) => state.itemInventory.itemInventoryList
  );
  let itemUOMs = useSelector((state) => state.settings.UOMs);
  const statuses = useSelector((state) => state.settings.status);
  const statusObj = statuses.reduce((acc, item) => {
    acc[item.name] = item.id;
    return acc;
  }, {});

  const updatingRestockDetailsRef = useRef(updatingRestockDetails);

  useEffect(() => {
    updatingRestockDetailsRef.current = updatingRestockDetails;
  }, [updatingRestockDetails]);

  let activeStatus = statuses.find((it) => it.name === "active");

  const fetchNProcessData = () => {
    const _itemInventoryList = itemInventoryList.filter(
      (it) => it.status === activeStatus.id && isExpired(it.expiration_date)
    );

    const _inventoryListGroupBySku = _itemInventoryList.reduce(
      (acc, item, index) => {
        const {
          sku_id,
          regular_net_qty_remaining,
          eaches_net_qty_remaining,
          regular_uom_id,
          eaches_remaining_uom_id,
        } = item;
        acc[sku_id] = acc[sku_id] || {
          regular_net_qty_remaining: 0,
          eaches_net_qty_remaining: 0,
          item_uom_id: "",
        };
        acc[sku_id].regular_net_qty_remaining += convertToNumber(
          regular_net_qty_remaining
        );
        acc[sku_id].eaches_net_qty_remaining += convertToNumber(
          eaches_net_qty_remaining
        );
        acc[sku_id].item_uom_id =
          acc[sku_id].item_uom_id || regular_uom_id || eaches_remaining_uom_id;
        return acc;
      },
      []
    );

    const _restockItemList = [];
    // /////////////////////// filter based on updating details [start] ///////////////////////////
    let targetItemSKUs = itemSKUs;
    if (updatingSummary && updatingRestockDetails.length) {
      targetItemSKUs = updatingRestockDetails.map((detail) => {
        let _itemSKU = itemSKUs.find((it) => it.id === detail.item_sku_id);
        return {
          ..._itemSKU,
          restocking_quantity: detail.restock_qty,
        };
      });
    }
    // /////////////////////// filter based on updating details [start] ///////////////////////////

    targetItemSKUs.map((itemSKU) => {
      let regular_net_qty_remaining =
        _inventoryListGroupBySku[itemSKU.id]?.regular_net_qty_remaining ?? 0;
      let eaches_net_qty_remaining =
        _inventoryListGroupBySku[itemSKU.id]?.eaches_net_qty_remaining ?? 0;
      let net_qty_remaining = Math.max(
        regular_net_qty_remaining,
        eaches_net_qty_remaining
      );
      let item_uom_id = _inventoryListGroupBySku[itemSKU.id]?.item_uom_id ?? "";

      if (convertToNumber(itemSKU.restocking_level) > net_qty_remaining) {
        let restocking_level_uom = itemUOMs.find(
          (it) => it.id === itemSKU.restocking_level_uom_id
        );
        let item_uom = item_uom_id
          ? itemUOMs.find((it) => it.id === item_uom_id)
          : {};

        _restockItemList.push({
          key: itemSKU.id,
          sku_id: itemSKU.id,
          sku_code: itemSKU.code,
          sku_name: itemSKU.name,
          net_qty_remaining: net_qty_remaining,
          item_uom_name: item_uom?.name ?? "",
          item_uom_id: item_uom_id,
          restocking_level: itemSKU.restocking_level,
          restocking_quantity: itemSKU?.restocking_quantity ?? 0,
          restocking_uom_name: restocking_level_uom?.name ?? "",
          restocking_level_uom_id: itemSKU.restocking_level_uom_id,
        });
      }
    });
    if (updatingSummary) {
      setInitialValuesForModalForm({
        cost_center_id: updatingSummary?.cost_center_id,
        generic_code: updatingSummary?.generic_code,
      });
    }
    updatingSummary && _restockItemList.sort(comparebyUpdatedDateTime);
    setRestockItemList(_restockItemList);
    setInventoryListGroupBySku(_inventoryListGroupBySku);
  };

  useEffect(() => {
    fetchNProcessData();
    return () => {
      // Cleanup logic here
    };
  }, [
    itemInventoryList,
    itemSKUs,
    updatingSummary,
    // updatingRestockDetailsRef.current,
  ]);

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      width: "10%",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => handleSave(record)}
              style={{ padding: "4px 8px", border: "none" }}
            >
              <SaveOutlined className="action-icon-button" />
            </Button>
            <Popconfirm title="Sure to cancel?" onConfirm={handleCancel}>
              <Button
                type="transparent"
                style={{ padding: "4px 8px", border: "none" }}
              >
                <CloseCircleOutlined className="action-icon-button" />
              </Button>
            </Popconfirm>
          </span>
        ) : (
          <Button
            disabled={editingKey !== ""}
            onClick={() => handleEdit(record)}
            style={{ padding: "4px 8px", border: "none" }}
          >
            <EditOutlined className="action-icon-button" />
          </Button>
        );
      },
    },
    {
      title: "Item SKU",
      dataIndex: "sku_code",
      align: "center",
      editable: true,
      width: "240px",
      render: (_, record, index) => `${record.sku_code} (${record.sku_name})`,
    },
    {
      title: "Current Qty (Regular/Eaches)",
      dataIndex: "net_qty_remaining",
      align: "center",
      width: "10%",
      render: (_, record, index) => record.net_qty_remaining,
    },
    {
      title: "UOM (Regular/Eaches)",
      dataIndex: "regular_uom",
      align: "center",
      render: (_, record, index) => record.item_uom_name,
      width: "10%",
    },
    {
      title: "Restocking Level",
      dataIndex: "restocking_level",
      align: "center",
      render: (_, record, index) => record.restocking_level,
    },
    {
      title: "Quantity to Re-stock",
      dataIndex: "restocking_quantity",
      align: "center",
      render: (_, record, index) => record.restocking_quantity,
      editable: true,
    },
    {
      title: "Restocking UOM",
      dataIndex: "restocking_uom_name",
      render: (_, record, index) => record.restocking_uom_name,
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType:
          col.dataIndex === "sku_code"
            ? "select"
            : col.dataIndex === "restocking_quantity"
            ? "number"
            : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing
          ? renderEditingForm(
              dataIndex,
              title,
              inputType,
              record,
              index,
              children,
              restProps
            )
          : children}
      </td>
    );
  };

  const getRules = (inputType, title) => {
    if (inputType === "number") {
      return [
        {
          required: true,
          message: `Please Input ${title}!`,
        },
        {
          type: "number",
          validator: (_, value) => {
            if (value > 0) {
              return Promise.resolve();
            }
            return Promise.reject("Product code must be greater than 0");
          },
        },
      ];
    }
    return [
      {
        required: true,
        message: `Please Input ${title}!`,
      },
    ];
  };

  const onItemSKUCodeChange = (value) => {
    let itemSKU = itemSKUs.find((it) => it.code === value);

    let regular_net_qty_remaining =
      inventoryListGroupBySku[itemSKU.id]?.regular_net_qty_remaining ?? 0;
    let eaches_net_qty_remaining =
      inventoryListGroupBySku[itemSKU.id]?.eaches_net_qty_remaining ?? 0;
    let net_qty_remaining = Math.max(
      regular_net_qty_remaining,
      eaches_net_qty_remaining
    );
    let item_uom_id = inventoryListGroupBySku[itemSKU.id]?.item_uom_id ?? "";

    let restocking_level_uom = itemUOMs.find(
      (it) => it.id === itemSKU.restocking_level_uom_id
    );
    let item_uom = item_uom_id
      ? itemUOMs.find((it) => it.id === item_uom_id)
      : {};

    const updatedRestockItemList = restockItemList.map((rsItem) => {
      return rsItem.key === "new"
        ? {
            ...rsItem,
            sku_id: itemSKU.id,
            sku_code: itemSKU.code,
            sku_name: itemSKU.name,
            net_qty_remaining: net_qty_remaining,
            item_uom_name: item_uom?.name ?? "",
            item_uom_id: item_uom_id,
            restocking_level: itemSKU.restocking_level,
            restocking_quantity: 0,
            restocking_uom_name: restocking_level_uom?.name ?? "",
            restocking_level_uom_id: itemSKU.restocking_level_uom_id,
          }
        : rsItem;
    });
    setRestockItemList(updatedRestockItemList);
  };

  const renderEditingForm = (
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    restProps
  ) => {
    return editingKey !== "new" && inputType === "select" ? (
      children
    ) : (
      <Form.Item
        name={dataIndex}
        style={{
          margin: 0,
        }}
        rules={getRules(inputType, title)}
      >
        {inputType === "select" ? (
          <Select
            showSearch
            placeholder="Select an item SKU code"
            onChange={onItemSKUCodeChange}
          >
            {itemSKUs.map((itemSKU) => {
              return (
                <Option value={itemSKU.code} key={itemSKU.code}>
                  {`${itemSKU.code} (${itemSKU.name})`}
                </Option>
              );
            })}
          </Select>
        ) : inputType === "number" ? (
          <InputNumber type="number" min={0} />
        ) : (
          <Input />
        )}
      </Form.Item>
    );
  };
  const isEditing = (record) => record.key === editingKey;

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };

  const handleCancel = () => {
    if (editingKey === "new") {
      let updatedRestockItemList = restockItemList.filter(
        (rsItem) => rsItem.key !== "new"
      );
      setRestockItemList(updatedRestockItemList);
      form.resetFields();
    }
    setEditingKey("");
  };

  const handleSave = async (record) => {
    try {
      const row = await form.validateFields();

      console.log("handle save row: ", record, row);
      let updatedRestockItemList = [];
      // const index = restockItemList.findIndex((item) => record.key === item.key);
      // if (index > -1) {
      updatedRestockItemList = restockItemList.map((rsItem) => {
        return record.key === rsItem.key && record.key === "new"
          ? {
              ...record,
              key: rsItem.sku_id + Date.now(),
              restocking_quantity: row.restocking_quantity,
            }
          : record.key === rsItem.key && record.key !== "new"
          ? { ...record, restocking_quantity: row.restocking_quantity }
          : rsItem;
      });
      setRestockItemList(updatedRestockItemList);
      // }
      form.resetFields();
      setEditingKey("");
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleAddRow = () => {
    if (editingKey === "new") return;
    const newRow = {
      key: "new",
      sku_id: "",
      sku_code: "",
      sku_name: "",
      net_qty_remaining: "",
      item_uom_name: "",
      item_uom_id: "",
      restocking_level: "",
      restocking_quantity: 0,
      restocking_uom_name: "",
      restocking_level_uom_id: "",
    };
    setRestockItemList([newRow, ...restockItemList]);
    setEditingKey(newRow.key);
  };

  const handleRequestRestock = async ({ cost_center_id, generic_code }) => {
    try {
      if (editingKey) {
        notification.error({
          message: "Please end the editing first.",
          title: "Error",
        });
        return;
      } else if (selectedRowKeys.length === 0) {
        notification.error({
          message: "Please select the rows to request",
          title: "Error",
        });
        return;
      }

      let summaryRes = {};
      if (updatingSummary) {
        // update the previous restock summary
        const summaryPutPayload = {
          cost_center_id,
          generic_code,
          person_id_updatedby: currentUser.id,
          restock_status: statusObj.pending,
        };
        summaryRes = await CRUD(
          "put",
          RestockSummaryUrl,
          summaryPutPayload,
          updatingSummary.id
        );
      } else {
        // make new one restock summary
        const summaryPostPayload = {
          cost_center_id,
          generic_code,
          issued_datetime: new Date(),
          person_id_issuedby: currentUser.id,
          restock_status: statusObj.pending,
        };
        summaryRes = await CRUD(
          "post",
          RestockSummaryUrl,
          summaryPostPayload,
          null
        );
      }
      
      selectedRowKeys &&
        selectedRowKeys.map(async (key) => {
          let _updatingRestockDetail = updatingRestockDetails.find(
            (it) => it.item_sku_id == key
          );
          let _restockDetailItem = restockItemList.find((it) => it.key === key);

          if (
            _restockDetailItem &&
            _restockDetailItem?.restocking_quantity > 0
          ) {

            if (_updatingRestockDetail) {
              // updated the previous restock detail
              let _detailPayload = {
                restock_qty: _restockDetailItem.restocking_quantity,
                // item_sku_id: _restockDetailItem.
              };
              const _detailRes = await CRUD(
                "put",
                RestockDetailsUrl,
                _detailPayload,
                _updatingRestockDetail.id
              );
            } else {
              // make the new restock detail

              let _detailPayload = {
                item_sku_id: _restockDetailItem.sku_id,
                restock_id: summaryRes.id,
                restock_qty: _restockDetailItem.restocking_quantity,
                uom_id: _restockDetailItem.restocking_level_uom_id,
                // item_sku_id: _restockDetailItem.
              };
              const _detailRes = await CRUD(
                "post",
                RestockDetailsUrl,
                _detailPayload,
                null
              );
            }
          }
        });
      handleRefresh();
      setSelectedRowKeys([]);
      setEditingKey("");
      history.push("/view_restock");
    } catch (error) {
      console.log("handleRequestRestock error: ", error);
    }
  };

  const handleRefresh = () => {
    fetchNProcessData();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (_selectedRowKeys, selectedRows) => {
      // console.log(" selected Rows info: ", selectedRows);
      setSelectedRowKeys(_selectedRowKeys);
    },
  };

  return (
    <div>
      <Row>
        <div className="page-main-title">
          {`Create / Update Restocking`}
          {updatingSummary && <span style={{fontSize: 18, color: '#000', paddingLeft: 8}}> {`(${updatingSummary.generic_code})`}</span>}
        </div>
      </Row>
      <Row style={{ justifyContent: "space-between", marginBottom: 16, marginTop: 16 }}>
        <Button
          disabled={editingKey === "new" ? true : false}
          onClick={handleAddRow}
          type="primary"
          style={{ paddingLeft: "24px", paddingRight: "24px" }}
        >
          Add New Item
        </Button>
        <Button
          onClick={() => setIsRequestModalOpen(true)}
          type="primary"
          style={{ paddingLeft: "24px", paddingRight: "24px" }}
        >
          {updatingSummary ? `Update Restock` : `Request Restock`}
        </Button>
      </Row>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              // row:EditableRow,
              cell: EditableCell,
            },
          }}
          rowSelection={rowSelection}
          bordered
          dataSource={restockItemList}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: handleCancel,
          }}
        />
      </Form>

      <RequestRestockModal
        title={"Request Restock Modal"}
        isModalOpen={isRequestModalOpen}
        setIsModalOpen={setIsRequestModalOpen}
        handleSubmit={handleRequestRestock}
        initialValues={initialValuesForModalForm}
      />
    </div>
  );
};
export default CreateRestock;