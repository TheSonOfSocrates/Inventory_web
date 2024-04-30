import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, Input, Spin, Row, Col, Upload } from "antd";
import {
	EditOutlined,
	ReloadOutlined,
	UploadOutlined,
	DownloadOutlined,
} from "@ant-design/icons";

import {
	DailyInventoryCountsUrl,
	CurrentItemInventoryUrl,
} from "../../utils/network";
import { CRUD, customRequest } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import {
	dailyInventoryListReceived,
	dailyInventoryUpdated,
} from "../../redux/dailyInventorySlice";
import { downloadFile } from "../../utils/fileHelper";
import { getFormattedTimestamp } from "../../utils/dateHelper";
import GeneralTable from "../../components/generalTable/GeneralTable";
import PageLayout from "../../components/PageLayout";
import {
	defaultColumnSorter,
	numberColumnSorter,
	dateColumnSorter,
} from "../../components/generalTable/GeneralTableHelper";

const DailyInventoryCounts = () => {
	const dispatch = useDispatch();

	const fetchDailyData = async () => {
		setLoading(true);
		const res = await CRUD("get", DailyInventoryCountsUrl, null, null);
		const postProcessedData = postProcess(res);
		dispatch(dailyInventoryListReceived(postProcessedData));
		setLoading(false);
	};

	const postProcess = (data) => {
		let processedList = [];
		data.map((datum) => {
			let selectedCurrentItem = itemInventoryList.find(
				(it) => it.id === datum.code
			);
			let selectedEntityItemSku = initItemSKUs.find(
				(it) => it.id === selectedCurrentItem?.sku_id
			);
			let selectedUOM = uoms.find((it) => it.id === datum.uom_id);
			const qtyDayManualArray = Object.keys(datum)
				.filter((key) => key.startsWith("qty_day_") && key.endsWith("_manual"))
				.map((key) => parseFloat(datum[key] ?? "-1"));

			const qtyDayAutoArray = Object.keys(datum)
				.filter((key) => key.startsWith("qty_day_") && key.endsWith("_auto"))
				.map((key) => parseFloat(datum[key] ?? "-1"));
			if (selectedCurrentItem && selectedUOM) {
				processedList.push({
					...datum,
					code: selectedCurrentItem.code,
					item_code: selectedCurrentItem.code,
					item_id: selectedCurrentItem.id,
					uom_name: selectedUOM.name,
					sku_name: selectedEntityItemSku?.name ?? "",
					qty_day_manual_array: qtyDayManualArray,
					qty_day_auto_array: qtyDayAutoArray,
				});
			}
		});
		return processedList;
	};

	const exportToCsv = (e) => {
		e.preventDefault();
		// Headers for each column
		let sep = ["sep=\\t"];
		let headers = [
			`Product_Id\tProduct_Name\tProduct_Code\tSKU_Name\tUOM_Id\tUOM_Name\tQty Day ${dayPointer}`,
		];
		// Convert users data to a csv
		let usersCsv = itemInventoryList.reduce((dd, item) => {
			const uom_id = item.regular_uom_id
				? item.regular_uom_id
				: item.eaches_received_uom_id
				? item.eaches_received_uom_id
				: item.eaches_remaining_uom_id ?? "";
			const selectedUOM = uoms.find((it) => it.id === uom_id);
			let selectedEntityItemSku = initItemSKUs.find(
				(it) => it.id === item?.sku_id
			);
			const uom_name = selectedUOM?.name ?? "";
			dd.push(
				[
					item.id ?? "",
					item?.name?.replace(/\t/g, " ") ?? "",
					item?.code?.replace(/\t/g, " ") ?? "",
					selectedEntityItemSku?.name?.replace(/\t/g, " ") ?? "",
					uom_id,
					uom_name.replace(/\t/g, " "),
				].join("\t")
			);
			return dd;
		}, []);

		downloadFile({
			data: [...sep, ...headers, ...usersCsv].join("\n"),
			fileName: "DailyInventoryCounts_Sample.csv",
			fileType: "text/csv",
		});
	};

	let userPerm = JSON.parse(localStorage.getItem("userPerm"));
	let uoms = useSelector((state) => state.settings.UOMs);
	let initItemSKUs = useSelector((state) => state.entities.itemSKUs);
	let isLoading = useSelector((state) => state.loadingStatus.isLoading);
	let itemInventoryList = useSelector(
		(state) => state.itemInventory.itemInventoryList
	);
	let dailyInventoryList = useSelector(
		(state) => state.dailyInventory.dailyInventoryList
	);

	useEffect(() => {
		fetchDailyData();
	}, []);

	useEffect(() => {
		setDailyData(dailyInventoryList);
		setDayPointer(parseInt(dailyInventoryList[0]?.day_pointer ?? "1"));
	}, [dailyInventoryList]);

	const [dailyData, setDailyData] = useState(dailyInventoryList);
	const [dayPointer, setDayPointer] = useState(
		parseInt(dailyInventoryList[0]?.day_pointer ?? "1")
	);
	const [currentItemInventories, setCurrentItemInventories] = useState(null);

	const initialEditingItem = {
		id: "",
		uom_name: "",
		item_code: "",
		key: "",
		value: -1,
	};
	const [currentPage, setCurrentPage] = useState(1); // Table data
	const [pageSize, setPageSize] = useState(10); // Table data
	const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
	const [visible, setVisible] = useState(null);
	const [editingItem, setEditingItem] = useState(initialEditingItem);

	const [loading, setLoading] = useState(false);
	const [editId, setEditId] = useState(null);
	const [UOMs, setUOMs] = useState([]);
	const [itemSKUs, setItemSKUs] = useState([]);
	const [tableColumns, setTableColumns] = useState([]);

	// CRUD Operation
	const handleOk = async () => {
		setIsModalVisible(false);
		if (editingItem.id.length && parseFloat(editingItem.value) >= 0) {
			let result = await CRUD(
				"put",
				DailyInventoryCountsUrl,
				{ [editingItem.key]: editingItem.value },
				editId
			);
			setEditingItem(initialEditingItem);
			fetchDailyData();
			// dispatch(dailyInventoryUpdated({
			//   id: editingItem.id,
			//   [editingItem.key]: editingItem.value
			// }))
		}
	};

	//Search
	const refresh = () => {
		fetchDailyData();
	};

	const handleEdit = (record) => {
		setEditingItem({
			id: record.id,
			item_code: record.item_code,
			uom_name: record.uom_name,
			key: `qty_day_${dayPointer}_manual`,
			value: record.qty_day_manual_array[dayPointer - 1],
		});
		setEditId(record.id);
		setIsModalVisible(true);
	};

	const getItem = useCallback(async () => {
		//loading modal delay
		if (isLoading) {
			setVisible(true);
		} else {
			setTimeout(() => {
				setVisible(false);
			}, 1000);
		}
		if (loading) {
			let res = await CRUD("get", DailyInventoryCountsUrl, null, null);
		}
		let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
		res === null
			? setCurrentItemInventories([])
			: setCurrentItemInventories(res);
		uoms && uoms.length > 0 ? setUOMs(uoms) : setUOMs([]);
		initItemSKUs && initItemSKUs.length > 0
			? setItemSKUs(initItemSKUs)
			: setItemSKUs([]);
		setLoading(false);
	}, [loading, uoms, initItemSKUs, isLoading, loading]);

	// useEffect(() => {
	//   getItem();
	// }, [getItem]);

	useEffect(() => {
		let qtyColumns = [];
		Array.from({ length: 30 }, (_, index) => index).map((it, idx) => {
			qtyColumns.push({
				title: () => {
					return dayPointer === idx + 1 ? (
						<>
							<strong className="selected-table-header">
								{" "}
								Day{idx + 1}_Auto{" "}
							</strong>
							<strong>Day{idx + 1}_Auto</strong>
						</>
					) : (
						<strong>Day{idx + 1}_Auto</strong>
					);
				},
				dataIndex: `qty_day_auto_${idx}`,
				key: `qty_day_auto_${idx}`,
				sortDirections: ["descend", "ascend"],
				sorter: numberColumnSorter(`qty_day_auto_${idx}`),
				render: (_, record, index) => {
					return record.qty_day_auto_array[idx] === -1
						? ""
						: record.qty_day_auto_array[idx];
				},
				style: { backgroundColor: "red" },
			});
			qtyColumns.push({
				title: () => {
					return dayPointer === idx + 1 ? (
						<>
							<strong className={"selected-table-header"}>
								{" "}
								Day{idx + 1}_Manual{" "}
							</strong>
							<strong>Day{idx + 1}_Manual</strong>
						</>
					) : (
						<strong>Day{idx + 1}_Manual</strong>
					);
				},
				// title: `Day${idx + 1}_Manual`,
				dataIndex: `qty_day_manual_${idx}`,
				key: `qty_day_manual_${idx}`,
				sortDirections: ["descend", "ascend"],
				sorter: numberColumnSorter(`qty_day_manual_${idx}`),
				render: (_, record, index) => {
					let _str =
						record.qty_day_manual_array[idx] === -1
							? ""
							: record.qty_day_manual_array[idx];
					return _str;
				},
			});
			qtyColumns.push({
				title: () => {
					return dayPointer === idx + 1 ? (
						<>
							<strong className={"selected-table-header"}> Discrepancy </strong>
							<strong>Discrepancy</strong>
						</>
					) : (
						<strong>Discrepancy</strong>
					);
				},
				// title: "Discrepancy",
				dataIndex: `qty_day_diff_${idx}`,
				key: `qty_day_diff_${idx}`,
				sortDirections: ["descend", "ascend"],
				sorter: numberColumnSorter(`qty_day_diff_${idx}`),
				render: (_, record, index) => {
					const _diff =
						record.qty_day_auto_array[idx] === -1
							? ""
							: record.qty_day_manual_array[idx] === -1
							? record.qty_day_auto_array[idx]
							: record.qty_day_auto_array[idx] -
							  record.qty_day_manual_array[idx];
					if (_diff > 0 && dayPointer === idx + 1)
						return <span style={{ color: "red" }}>{_diff}</span>;
					return _diff;
				},
			});
		});
		const columns = [
			{
				title: "No",
				dataIndex: "no",
				key: "no",
				render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
			},
			{
				title: "Actions",
				key: "actions",
				render: (_, record, index) => (
					<div>
						{userPerm &&
						userPerm.perm_update_dailyinventorycount === "1" &&
						userPerm.perm_update_main === "1" ? (
							<Button
								type="circle"
								style={{
									color: "white",
									background: "green",
								}}
								onClick={() => handleEdit(record)}
							>
								<EditOutlined />
							</Button>
						) : null}
					</div>
				),
			},
			{
				title: "Code",
				dataIndex: "code",
				key: "code",
				sortDirections: ["descend", "ascend"],
				sorter: dateColumnSorter("item_code"),
				render: (_, record, index) => {
					return record.item_code;
				},
			},
			{
				title: "UOM",
				dataIndex: "uom_id",
				key: "uom_id",
				sortDirections: ["descend", "ascend"],
				sorter: dateColumnSorter("uom_name"),
				render: (_, record, index) => {
					return record.uom_name;
				},
			},
			...qtyColumns,
		];
		setTableColumns(columns);
	}, [dayPointer]);

	const processDataForExcel = () => {
		return dailyData;
	};

	return (
		<>
			{loading ? (
				<Spin size="large" />
			) : (
				<div>
					<PageLayout title={`Daily Inventory Counts (Day: ${dayPointer})`}>
						<GeneralTable
							data={dailyData}
							columns={tableColumns}
							onRefresh={refresh}
							onUpload={(options) =>
								customRequest(
									options,
									`DailyInventoryCounts_${getFormattedTimestamp()}`
								)
							}
							processDataForExcel={processDataForExcel}
							paperSize="A1"
						/>
					</PageLayout>
					{/* <span style={{ margin: "0 8px" }} />
          <span
            style={{
              color: "green",
              fontSize: 20,
              fontFamily: "cursive",
            }}
          >
            DailyInventoryCounts <br />
            <span style={{ margin: "0 8px" }} />
            <small className="" style={{ color: "grey" }}>
              Day Pointer: {dayPointer}
            </small>
          </span>
          <div className="btn-ipt-group">
            <div className="btn-group">
              <div className="refresh-wrapper rightItem">
                <Button icon={<ReloadOutlined />} onClick={refresh}>
                  Refresh
                </Button>
              </div>

              <div className="upload-wrapper rightItem">
                <Button icon={<DownloadOutlined />} onClick={exportToCsv}>
                  Download
                </Button>
              </div>

              <div className="upload-wrapper rightItem">
                <Upload
                  name="file"
                  accept=".csv,.xlsx"
                  customRequest={(options) =>
                    customRequest(
                      options,
                      `DailyInventoryCounts_${getFormattedTimestamp()}`
                    )
                  }
                  multiple={false}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </div>
            </div>
          </div>
          <Table
            style={{ display: "flex", marginTop: "70px" }}
            dataSource={dailyData.map((item, index) => ({
              ...item,
              key: index,
            }))}
            columns={tableColumns}
            pagination={{
              position: ["bottomLeft"],
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: true,
              onShowSizeChange: (current, size) => setPageSize(size),
            }}
          /> */}
					{/* Modal for Add/Edit */}
					<Modal title="Loading Data" open={visible} footer={null}>
						<Loading />
					</Modal>
					<Modal
						open={isModalVisible}
						title={
							editingItem
								? `Edit Item  (Date ${dayPointer})`
								: "Date Pointer: Day1"
						}
						onCancel={() => {
							setIsModalVisible(false);
						}}
						onOk={handleOk}
					>
						<Row gutter={16} style={{ width: "100%" }}>
							<Col
								className="gutter-row"
								span={8}
								style={{ textAlign: "left" }}
							>
								<div>{editingItem.item_code}</div>
							</Col>
							<Col
								className="gutter-row"
								span={12}
								style={{ textAlign: "center" }}
							>
								<Input
									placeholder="Manual Qty"
									type="number"
									value={editingItem.value}
									onChange={(e) =>
										setEditingItem({
											...editingItem,
											value: e.target.value,
										})
									}
								/>
							</Col>
							<Col
								className="gutter-row"
								span={4}
								style={{ textAlign: "right" }}
							>
								<div>{editingItem.uom_name}</div>
							</Col>
						</Row>
					</Modal>
				</div>
			)}
		</>
	);
};

export default DailyInventoryCounts;
