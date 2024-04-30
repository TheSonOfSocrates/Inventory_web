import { useCallback, useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button, Modal, Form, Input, Spin, Select } from "antd";
import { EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
	CurrentItemInventoryUrl,
	ItemBOMUrl,
	BaseUrl,
} from "../../../utils/network";
import { CRUD, search } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import ItemBomModal from "../../../utils/item_bom_modal";
import { itemBOMListReceived } from "../../../redux/itemBOMSlice";
import { convertToLocalTime } from "../../../utils/dateHelper";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
	defaultColumnSorter,
	numberColumnSorter,
	dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const { Search } = Input;
const ItemBOM = () => {
	const [currentPage, setCurrentPage] = useState(1); // Table data
	const [pageSize, setPageSize] = useState(10); // Table data
	const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
	const [visible, setVisible] = useState(null);
	const [editingItem, setEditingItem] = useState(null);

	const [form] = Form.useForm(); // Form instance
	const [loading, setLoading] = useState(false);
	const [upgrade, setUpgrade] = useState(false);
	const [editId, setEditId] = useState(null);
	const [data, setData] = useState([]);

	// const [code, setCode] = useState(null);
	const [currentItemInventories, setCurrentItemInventories] = useState([]);
	const [rawItemData, setRawItemData] = useState([]);
	const [productCode, setProductCode] = useState([]);
	const [itemBomData, setItemBomData] = useState({
		new_item_id: null,
		raw_item_id: null,
		net_current_qty: null,
		uom_id: null,
	});
	const [itemBOMData, setItemBOMData] = useState([]);

	const dispatch = useDispatch();
	const history = useHistory();
	const itemBomModalRef = useRef(null);
	let userPerm = JSON.parse(localStorage.getItem("userPerm"));
	let itemSKUs = useSelector((state) => state.entities.itemSKUs);
	let itemCategories = useSelector((state) => state.settings.itemCategories);
	let companies = useSelector((state) => state.entities.companies);
	let UOMs = useSelector((state) => state.settings.UOMs);
	let handlingUnits = useSelector((state) => state.settings.handlingUnits);
	let isLoading = useSelector((state) => state.loadingStatus.isLoading);
	let accessCodes = useSelector((state) => state.settings.accessCodes);
	let itemInventoryList = useSelector(
		(state) => state.itemInventory.itemInventoryList
	);
	let itemBOMList = useSelector((state) => state.itemBOM.itemBOMList);
	let persons = useSelector((state) => state.entities.persons);

	const fetchItemBomData = async () => {
		setLoading(true);
		const res = await CRUD("get", ItemBOMUrl, null, null);
		const postProcessedData = postProcess(res);
		dispatch(itemBOMListReceived(postProcessedData));
		setLoading(false);
	};

	useEffect(() => {
		fetchItemBomData();
	}, []);

	useEffect(() => {
		setItemBOMData(itemBOMList);
	}, [itemBOMList]);

	const processDataForExcel = () => {
		return data.map((record) => {
			const { status, ...updatedRecord } = record;
			let selPersonCreatedBy = persons.find(
				(item) => item.id === record.person_id_createdby
			);
			const selAccessCode = accessCodes.find(
				(item) => item.id === record.accessCode
			);
			selAccessCode && (updatedRecord.accessCode = selAccessCode.name);

			selPersonCreatedBy &&
				(updatedRecord.person_id_createdby = selPersonCreatedBy.user_name);
			let selPersonUpdatedBy = persons.find(
				(item) => item.id === record.person_id_updatedby
			);
			selPersonUpdatedBy &&
				(updatedRecord.person_id_updatedby = selPersonUpdatedBy.user_name);
			return updatedRecord;
		});
	};

	const postProcess = (data) => {
		let processedList = [];
		console.log("fetch item bom api data ===> ", data);
		data.map((datum) => {
			console.log("datum ===>");
			// let selectedNewItem = itemInventoryList.find(it => it.id === datum.new_item_id);
			// let selectedRawItem = itemInventoryList.find(it => it.id === datum.raw_item_id);
			// let selectedUOM = UOMs.find(it => it.id === datum.uom_id);

			// if (selectedNewItem) {
			processedList.push({
				...datum,
				// new_item_id: selectedNewItem?.id ?? "",
				// raw_item_code: selectedRawItem?.code ?? "",
				// uom_name: selectedUOM?.name ?? "",
				// uom_acronym: selectedUOM?.acronym ?? "",
			});
			// }
		});

		processedList = processedList.filter(
			(item, index, self) =>
				index === self.findIndex((t) => t.code === item.code)
		);
		console.log("after removing the duplicate", processedList);
		processedList = processedList.sort(compareFu);
		return processedList;
	};

	const compareFu = (a, b) => {
		const nameA = a.code || "";
		const nameB = b.code || "";
		return nameA.localeCompare(nameB);
	};

	const updateItemBomData = (value) => {
		setItemBomData(value);
	};

	//Search
	const refresh = () => {
		fetchItemBomData();
	};

	//Search
	const onSearch = async (value) => {
		if (value) {
			const timestamp = Date.now();
			const SearchUrl =
				BaseUrl + `api/ItemBOM/?timestamp=${timestamp}&search=${value}`;
			let res = await search("get", SearchUrl, null, null);
			setData(res);
		} else {
			let res = await CRUD("get", ItemBOMUrl, null, null);
			setData(res);
		}
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
		if (!loading) {
			let res = await CRUD("get", ItemBOMUrl, null, null);
			let resCurrentItems = await CRUD(
				"get",
				CurrentItemInventoryUrl,
				null,
				null
			);
			setProductCode(resCurrentItems.map((item) => ({ value: item.code })));
			setRawItemData(
				resCurrentItems
					.map((item) => {
						const matchedCategory = itemCategories.find(
							(category) => item.category_id === category.id
						);
						if (matchedCategory) {
							if (matchedCategory.name.toLowerCase().includes("raw"))
								return { value: item.code, id: item.id };
						}
						return null;
					})
					.filter((data) => data !== null)
			);
			console.log("rawItemData", rawItemData);
			// console.log('resCurrentItems', resCurrentItems);
			setData(res);
		}
		let res = await CRUD("get", CurrentItemInventoryUrl, null, null);
		res === null
			? setCurrentItemInventories([])
			: setCurrentItemInventories(res);
		let response = await CRUD("get", ItemBOMUrl, null, null);
		response === null ? setData([]) : setData(response);

		// if (currentItemInventories !== null) {
		//   // setProductCode(
		//   //   currentItemInventories.map((item) => ({ value: item.code }))
		//   // );
		//   // console.log('currentItemInventories=====', currentItemInventories);
		//   // console.log(
		//   //   'In here we can set the product code when current is not null=======',
		//   //   productCode
		//   // );
		//   // setSku(currentItemInventories.map((item) => ({ value: item.sku_id })));
		// }

		setLoading(false);
	}, [isLoading, loading]);

	useEffect(() => {
		getItem();
		setUpgrade(false);
	}, [upgrade, getItem]);

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
					userPerm.perm_update_itembom === "1" &&
					userPerm.perm_update_main === "1" ? (
						<Button
							type="circle"
							style={{
								color: "white",
								background: "green",
							}}
							onClick={() => {
								history.push({
									pathname: "/create_item_BOM",
									state: { product_code: record.code, backUrl: "/itemBOM" },
								});
							}}
						>
							<EditOutlined />
						</Button>
					) : null}
					{/* {userPerm && userPerm.per_delete_itembom === "1" && userPerm.perm_delete_main === '1' ? (
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
          ) : null} */}
				</div>
			),
		},
		{
			title: "New Item Code",
			dataIndex: "new_item_code",
			key: "new_item_code",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("code"),
			render: (_, record, index) => {
				return record.code;
			},
		},
		{
			title: "Created By",
			dataIndex: "person_id_createdby",
			key: "person_id_createdby",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("person_id_createdby"),
			render: (_, record, index) => {
				let res = persons.filter(
					(item) => item.id === record.person_id_createdby
				);
				return res.length > 0 ? res[0].user_name : "";
			},
		},
		{
			title: "Created On",
			dataIndex: "created_datetime",
			key: "created_datetime",
			sorter: (a, b) =>
				new Date(a.updated_datetime) - new Date(b.created_datetime),
			sortDirections: ["descend", "ascend"],
			render: (_, record, index) => {
				return convertToLocalTime(record.created_datetime);
			},
		},
		{
			title: "Updated By",
			dataIndex: "person_id_updatedby",
			key: "person_id_updatedby",
			sortDirections: ["descend", "ascend"],
			render: (_, record, index) => {
				let res = persons.filter(
					(item) => item.id === record.person_id_updatedby
				);
				return res.length > 0 ? res[0].user_name : "";
			},
		},
		{
			title: "Updated On",
			dataIndex: "updated_datetime",
			key: "updated_datetime",
			sorter: (a, b) =>
				new Date(a.updated_datetime) - new Date(b.updated_datetime),
			sortDirections: ["descend", "ascend"],
			render: (_, record, index) => {
				return convertToLocalTime(record.updated_datetime);
			},
		},
		{
			title: "Access Code",
			dataIndex: "accessCode",
			key: "accessCode",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("accessCode"),
			render: (_, record, index) => {
				return record.accessCode ?? "";
			},
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			sorter: defaultColumnSorter("status"),
			sortDirections: ["descend", "ascend"],
			render: (_, record, index) => {
				return record && record.status === true ? "approved" : "pending";
			},
		},
	];

	return (
		<>
			{loading ? (
				<Spin size="large" />
			) : (
				<div>
					<PageLayout
						title="Item BOM / Assembly"
						titleRightAction={() =>
							userPerm &&
							userPerm.perm_create_itembom === "1" &&
							userPerm.perm_create_main === "1" ? (
								<Button
									type="circle"
									style={{
										color: "white",
										background: "green",
									}}
									onClick={() => {
										history.push({
											pathname: "/create_item_BOM",
											state: { product_code: "" },
										});
									}}
								>
									<PlusOutlined style={{ size: 20 }} />
								</Button>
							) : null
						}
					>
						<GeneralTable
							data={data}
							columns={columns}
							onSearch={onSearch}
							onRefresh={refresh}
							processDataForExcel={processDataForExcel}
						/>
					</PageLayout>

					{/* Modal for Add/Edit */}
					<Modal title="Loading Data" open={visible} footer={null}>
						<Loading />
					</Modal>
				</div>
			)}
		</>
	);
};

export default ItemBOM;
