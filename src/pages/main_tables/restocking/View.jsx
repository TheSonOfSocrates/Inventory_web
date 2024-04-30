import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
	SaveOutlined,
	SaveTwoTone,
	CloseCircleOutlined,
	EditOutlined,
	CheckCircleOutlined,
	DeleteOutlined,
} from "@ant-design/icons";

import { updateLoadingStatus } from "../../../redux/slice";
import { CRUD, search } from "../../../utils/js_functions";
import { RestockDetailsUrl, RestockSummaryUrl } from "../../../utils/network";
import { getPerms } from "../../../utils/js_functions";
import { convertToNumber } from "../../../utils/numberHelper";
import IconButton from "../../../components/buttons/IconButton";
import {
	convertToLocalTime,
	comparebyUpdatedDateTime,
} from "../../../utils/dateHelper";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
	defaultColumnSorter,
	numberColumnSorter,
	dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

const { Title, Paragraph, Text, Link } = Typography;

const ViewRestock = () => {
	let currentUser = JSON.parse(localStorage.getItem("currentUser"));
	let perms = useSelector((state) => state.settings.rolesAndPermissions);
	let currentUserPerms = getPerms(perms);

	// console.log("[view restock] currentuser ==>", currentUser, currentUserPerms);
	const [restockSummaryList, setRestockSummaryList] = useState([]);
	const [restockDetailList, setRestockDetailList] = useState([]);

	const form = Form.useForm();
	const history = useHistory();
	const dispatch = useDispatch();

	const statuses = useSelector((state) => state.settings.status);
	const entityPersonList = useSelector((state) => state.entities.persons);
	const costCenters = useSelector((state) => state.settings.costCenters);
	const statusObj = statuses.reduce((acc, item) => {
		acc[item.name] = item.id;
		return acc;
	}, {});

	const fetchNProcessData = async (url) => {
		try {
			dispatch(updateLoadingStatus(true));
			let _restockSummaryRes = await CRUD("get", url, null, null);

			let _restockSummaryList = [];
			_restockSummaryRes &&
				_restockSummaryRes.map((it) => {
					const {
						id,
						issued_datetime,
						updated_datetime,
						approved_datetime,
						person_id_issuedby,
						person_id_approvedby,
						generic_code,
						cost_center_id,
						restock_status,
						status,
					} = it;
					let _status = statuses.find((st) => st.id === restock_status);
					let _issuedPerson = entityPersonList.find(
						(ep) => ep.id === person_id_issuedby
					);
					let _approvedPerson = entityPersonList.find(
						(ep) => ep.id === person_id_approvedby
					);
					let _costCenter = costCenters.find((cc) => cc.id === cost_center_id);
					let _newSummary = {
						key: it.id,
						id,
						issued_datetime: convertToLocalTime(issued_datetime),
						updated_datetime: updated_datetime,
						approved_datetime: convertToLocalTime(approved_datetime),
						person_id_issuedby,
						person_name_issuedby: _issuedPerson?.user_name ?? "",
						person_id_approvedby,
						person_name_approvedby: _approvedPerson?.user_name ?? "",
						generic_code,
						cost_center_id,
						cost_center_name: _costCenter?.name ?? "",
						status: restock_status,
						status_name: _status?.name ?? "",
					};
					_restockSummaryList.push(_newSummary);
				});
			dispatch(updateLoadingStatus(false));
			_restockSummaryList.sort(comparebyUpdatedDateTime);
			setRestockSummaryList(_restockSummaryList);
		} catch (error) {
			dispatch(updateLoadingStatus(false));
			console.log("[view restocking] fetching error", error);
		}
	};

	const handleApprove = async (record) => {
		try {
			const _payload = {
				status: statusObj.approved,
				restock_status: statusObj.approved,
				person_id_approvedby: currentUser.id,
				approved_datetime: new Date(),
			};
			const res = await CRUD("put", RestockSummaryUrl, _payload, record.id);
			const _updatedRestockSummaryList = restockSummaryList.map((summary) =>
				summary.id === record.id
					? {
							...summary,
							status: res.status,
							restock_status: res.restock_status,
							status_name: "approved",
							person_name_approvedby: currentUser?.user_name ?? "",
							person_id_approvedby: res.person_id_approvedby,
							approved_datetime: convertToLocalTime(res.approved_datetime),
					  }
					: summary
			);
			setRestockSummaryList(_updatedRestockSummaryList);
		} catch (error) {
			console.log("[handle approve] error", error);
		}
	};

	const handleDelete = async (record) => {
		try {
			console.log("[handle delete] ====>", record, statusObj);
			await CRUD("delete", RestockSummaryUrl, null, record.id);
			const restockDetailsRes = await CRUD(
				"get",
				RestockDetailsUrl + `?restock_id=${record.id}`,
				null
			);
			if (restockDetailsRes) {
				const deletePromises = restockDetailsRes.map(async (_detail) => {
					await CRUD("delete", RestockDetailsUrl, null, _detail.id);
				});
				await Promise.all(deletePromises);
			}

			const _updatedRestockSummaryList = restockSummaryList.filter(
				(summary) => summary.id !== record.id
			);
			setRestockSummaryList(_updatedRestockSummaryList);
		} catch (error) {
			console.log("[handle delete] error", error);
		}
	};

	const handleReject = async (record) => {
		try {
			console.log("[handle reject] ====>", record, statusObj);
			const _payload = {
				status: statusObj.rejected,
				person_id_approvedby: "",
				approved_datetime: null,
			};
			const res = await CRUD("put", RestockSummaryUrl, _payload, record.id);
			const _updatedRestockSummaryList = restockSummaryList.map((summary) =>
				summary.id === record.id
					? {
							...summary,
							status_name: "rejected",
							person_name_approvedby: "",
							status: statusObj.rejected,
							restock_status: statusObj.rejected,
							person_id_approvedby: "",
							approved_datetime: convertToLocalTime(res.approved_datetime),
					  }
					: summary
			);
			setRestockSummaryList(_updatedRestockSummaryList);
		} catch (error) {
			console.log("[handle reject] error", error);
		}
	};

	const handleEdit = async (record) => {
		console.log("[handle edit] =====>", record);
		let restockDetails = await CRUD(
			"get",
			RestockDetailsUrl + `?restock_id=${record.id}`,
			null,
			null
		);
		history.push({
			pathname: "/create_restock",
			state: {
				updatingSummary: record,
				updatingRestockDetails: restockDetails,
			},
		});
	};

	const onSearch = async (value) => {
		if (value) {
			const timestamp = Date.now();
			const SearchUrl =
				RestockSummaryUrl + `?timestamp=${timestamp}&search=${value}`;
			fetchNProcessData(SearchUrl);
		} else {
			fetchNProcessData(RestockSummaryUrl);
		}
	};

	const columns = [
		{
			title: "Action",
			dataIndex: "action",
			// width: '180px',
			align: "center",
			render: (_, record) => {
				return (
					<Row justify={"center"}>
						{currentUserPerms.perm_manage_restock &&
							(record.status_name === "pending" ||
								record.status_name === "rejected") && (
								<Button
									onClick={() => handleApprove(record)}
									style={{ padding: "4px 8px", border: "none" }}
								>
									<CheckCircleOutlined className="action-icon-button" />
								</Button>
							)}
						{/* <IconButton handleClick={()=>{}}> */}
						{/* </IconButton> */}
						{(record.status_name === "pending" ||
							record.status_name === "rejected") && (
							<Button
								onClick={() => handleEdit(record)}
								style={{ padding: "4px 8px", border: "none" }}
							>
								<EditOutlined className="action-icon-button" />
							</Button>
						)}
						{(record.status_name === "pending" ||
							record.status_name === "rejected") && (
							<Popconfirm
								title="Sure to Delete?"
								onConfirm={() => handleDelete(record)}
							>
								<Button
									// disabled={editingKey !== ""}
									style={{ padding: "4px 8px", border: "none" }}
								>
									<DeleteOutlined className="action-icon-button" />
								</Button>
							</Popconfirm>
						)}
						{record.status_name === "approved" && (
							<Popconfirm
								title="Sure to reject?"
								onConfirm={() => handleReject(record)}
							>
								<Button
									disabled={currentUserPerms.perm_manage_restock ? false : true}
									style={{ padding: "4px 8px", border: "none" }}
								>
									<CloseCircleOutlined className="action-icon-button" />
								</Button>
							</Popconfirm>
						)}
					</Row>
				);
			},
		},
		{
			title: "Restock Code",
			dataIndex: "generic_code",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("generic_code"),
			render: (_, record, index) => record.generic_code,
		},
		{
			title: "Issued By",
			dataIndex: "person_name_issuedby",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("person_name_issuedby"),
			render: (_, record, index) => record.person_name_issuedby,
		},
		{
			title: "Date Issued",
			dataIndex: "issued_datetime",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: dateColumnSorter("issued_datetime"),
			render: (_, record, index) => record.issued_datetime,
		},
		{
			title: "Approved By",
			dataIndex: "person_name_approvedby",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: dateColumnSorter("person_name_approvedby"),
			render: (_, record, index) => record.person_name_approvedby,
		},
		{
			title: "Date Approved",
			dataIndex: "approved_datetime",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: dateColumnSorter("approved_datetime"),
			render: (_, record, index) => record.approved_datetime,
		},
		{
			title: "Cost Center",
			dataIndex: "cost_center_name",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("cost_center_name"),
			render: (_, record, index) => record.cost_center_name,
		},
		{
			title: "Status",
			dataIndex: "status_name",
			align: "center",
			sortDirections: ["descend", "ascend"],
			sorter: defaultColumnSorter("status_name"),
			render: (_, record, index) => record.status_name,
		},
	];

	const processDataForExcel = () => {
		return restockSummaryList;
	};

	const refresh = () => {
		fetchNProcessData(RestockSummaryUrl);
	};

	useEffect(() => {
		fetchNProcessData(RestockSummaryUrl);
	}, []);

	const handleCancel = () => {};

	return (
		<PageLayout title="Restocking Request Summary">
			<GeneralTable
				data={restockSummaryList}
				columns={columns}
				onSearch={onSearch}
				onRefresh={refresh}
				// onUpload={(options) => customRequest(options, tableName)}
				processDataForExcel={processDataForExcel}
				paperSize="A1"
			/>
		</PageLayout>
	);
};

export default ViewRestock;
