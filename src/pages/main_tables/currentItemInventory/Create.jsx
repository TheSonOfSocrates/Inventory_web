import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo } from "react";
import { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { convertToNumber } from "../../../utils/numberHelper";
import {
	Button,
	Checkbox,
	Col,
	//   ColorPicker,
	Form,
	InputNumber,
	Radio,
	Rate,
	Row,
	Select,
	Slider,
	Space,
	Switch,
	Upload,
	DatePicker,
	Input,
	Card,
} from "antd";
import { relative } from "path";
import PageLayout from "../../../components/PageLayout";
import { useSelector } from "react-redux";
import { formItemLayout } from "../../../utils/data";
import { CRUD, customRequest } from "../../../utils/js_functions";
import { CurrentItemInventoryUrl } from "../../../utils/network";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import SelectEmbededDevice from "../../../components/modals/SelectEmbededDevice";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

const { Option } = Select;
const { TextArea } = Input;

const dateFormat = "YYYY-MM-DD";
const alphanumericPattern = /^[a-zA-Z0-9]*$/;

const DEFAULT_DAYSTOEXPIRE_NUMBER = 5;
const DEFAULT_SUPPLIER_TYPE = "company";
const DEFAULT_CUSTOMER_TYPE = "company";

const regularUOMFields = [
	"regular_uom_id",
	"regular_net_qty_received",
	"regular_net_qty_remaining",
];

const eachesUOMFields = [
	"eaches_received_uom_id",
	"eaches_remaining_uom_id",
	"eaches_net_qty_received",
	"eaches_net_qty_remaining",
];

const CreateCurrentItemInventory = ({ location }) => {
	const { updatingCurrentItemInventory } = location?.state ?? {
		updatingCurrentItemInventory: null,
	};

	const previousFormValuesRef = useRef({});

	const [checked, setChecked] = useState(false);
	const [supplierType, setSupplierType] = useState(DEFAULT_SUPPLIER_TYPE);
	const [customerType, setCustomerType] = useState(DEFAULT_CUSTOMER_TYPE);

	const [supplierList, setSupplierList] = useState([]);
	const [customerList, setCustomerList] = useState([]);
	const [isUpdating, setIsUpdating] = useState(false);
	const [locationMapById, setLocationMapById] = useState([]);
	const [locationMapByCode, setLocationMapByCode] = useState([]);
	const [locationList, setLocationList] = useState([]);
	const [expirateMinDate, setExpirateMinDate] = useState(null);
	const [itemTypeName, setItemTypeName] = useState("");
	const [daysToExpireNum, setDaysToExpireNum] = useState(
		DEFAULT_DAYSTOEXPIRE_NUMBER
	);

	const history = useHistory();
	const [form] = Form.useForm();
	// const itemInventoryList = useSelector(
	//   (state) => state.itemInventory.itemInventoryList
	// );
	const persons = useSelector((state) => state.entities.persons);
	const companies = useSelector((state) => state.entities.companies);
	const itemUOMs = useSelector((state) => state.settings.UOMs);
	const costCenters = useSelector((state) => state.settings.costCenters);
	const itemSKUs = useSelector((state) => state.entities.itemSKUs);
	const handlingUnits = useSelector((state) => state.settings.handlingUnits);
	const accessCodes = useSelector((state) => state.settings.accessCodes);
	const itemTypes = useSelector((state) => state.settings.itemTypes);
	const itemSubTypes = useSelector((state) => state.settings.itemSubTypes);
	const itemCategories = useSelector((state) => state.settings.itemCategories);
	const itemSubCategories = useSelector(
		(state) => state.settings.itemSubCategories
	);

	const countries = useSelector((state) => state.settings.countries);
	const regions = useSelector((state) => state.settings.regions);
	const branches = useSelector((state) => state.settings.branches);
	const warehouses = useSelector((state) => state.settings.warehouses);
	const zones = useSelector((state) => state.settings.zones);
	const areas = useSelector((state) => state.settings.areas);
	const rooms = useSelector((state) => state.settings.rooms);
	const rows = useSelector((state) => state.settings.rows);
	const bays = useSelector((state) => state.settings.bays);
	const levels = useSelector((state) => state.settings.levels);
	const positions = useSelector((state) => state.settings.positions);
	const bins = useSelector((state) => state.settings.bins);

	const [selectedRegularInOutUOM,setSelectedRegularInOutUOM, ] = useState(null)
	const [selectedEachesUOM,setSelectedEachesUOM, ] = useState(null)

	const [eachesSelectedEmbeddedDevice, seteachesSelectedEmbeddedDevice] = useState('')
	const [regularSelectedEmbeddedDevice, setregularSelectedEmbeddedDevice] = useState('')

	// useEffect(() => {
	// 	// Update the name state whenever the value of the 'name' field changes
	// 	const unsubscribe = form.watch(['eaches_embedded_device_id', 'regular_embedded_device_id'], (value) => {
	// 		console.log(value)
	// 	//   setName(value);
	// 	});
	
	// 	return () => {
	// 	  unsubscribe();
	// 	};
	//   }, [form]);

	useEffect(() => {
		updatingCurrentItemInventory?.regular_net_qty_remaining &&
			(previousFormValuesRef.current["regular_net_qty_remaining"] =
				convertToNumber(
					updatingCurrentItemInventory.regular_net_qty_remaining
				));
		updatingCurrentItemInventory?.eaches_net_qty_remaining &&
			(previousFormValuesRef.current["eaches_net_qty_remaining"] =
				convertToNumber(updatingCurrentItemInventory.eaches_net_qty_remaining));
	}, []);

	useEffect(() => {
		let settingsLocations = {
			country: countries,
			region: regions,
			branch: branches,
			warehouse: warehouses,
			zone: zones,
			area: areas,
			room: rooms,
			row: rows,
			bay: bays,
			level: levels,
			position: positions,
			bin: bins,
		};
		let location_mapping_by_code = {};
		let location_mapping_by_id = {};
		let location_list = [];
		for (let setting_location_label in settingsLocations) {
			let setting_location_obj = settingsLocations[setting_location_label];

			for (let each_location of setting_location_obj) {
				location_mapping_by_code[each_location.code] = {
					id: each_location.id,
					name: each_location?.name ?? "",
					currentiteminventory_field: setting_location_label + "_id",
					parent_location_id: each_location.parent_location_id || "",
				};

				location_mapping_by_id[each_location.id] = {
					id: each_location.id,
					name: each_location?.name ?? "",
					code: each_location?.code ?? "",
					currentiteminventory_field: setting_location_label + "_id",
					parent_location_id: each_location.parent_location_id || "",
				};
				location_list.push({
					id: each_location.id,
					name: each_location?.name ?? "",
					code: each_location?.code ?? "",
					currentiteminventory_field: setting_location_label + "_id",
					parent_location_id: each_location.parent_location_id || "",
				});
			}
		}
		console.log(" mappings", location_mapping_by_code, location_mapping_by_id);
		console.log("settingsLocations", settingsLocations);
		setLocationMapByCode(location_mapping_by_code);
		setLocationMapById(location_mapping_by_id);
		setLocationList(location_list);
	}, [
		countries,
		regions,
		branches,
		warehouses,
		zones,
		areas,
		rooms,
		rows,
		bays,
		levels,
		positions,
		bins,
	]);

	useEffect(() => {
		if (!updatingCurrentItemInventory) return;
		if (updatingCurrentItemInventory) {
			setIsUpdating(true);
		} else {
			setIsUpdating(false);
		}
		const {
			code,
			sku_id,
			generic_code,
			name,
			description,
			lot_number,
			batch_number,
			cost_center_id,
			datetime_in,
			manufacturing_date,
			slaughter_date,
			production_date,
			processing_date,
			expiration_date,
			company_supplier_id, // company_customer_id or person_supplier_id,
			person_supplier_id,
			company_customer_id,
			person_customer_id,
			type_id,
			subtype_id,
			category_id,
			subcategory_id,
			top_handling_unit_id,
			no_top_handling_unit, //top_handling_unit_qty,
			bottom_handling_unit_id,
			no_bottom_handling_unit, //bottom_handling_unit_qty,
			regular_uom_id,
			regular_net_qty_received,
			regular_net_qty_remaining,
			eaches_received_uom_id,
			eaches_remaining_uom_id,
			eaches_net_qty_received,
			eaches_net_qty_remaining,
			fifo,
			fefo,
			accessCode,
			country_id,
			region_id,
			branch_id,
			warehouse_id,
			zone_id,
			area_id,
			room_id,
			row_id,
			bay_id,
			level_id,
			position_id,
			bin_id,
		} = updatingCurrentItemInventory;
		console.log(
			"==============> step1 updatingCurrentItemInventory:",
			updatingCurrentItemInventory
		);

		const country_name = locationMapById[country_id]?.name ?? "";
		const region_name = locationMapById[region_id]?.name ?? "";
		const branch_name = locationMapById[branch_id]?.name ?? "";
		const warehouse_name = locationMapById[warehouse_id]?.name ?? "";
		const zone_name = locationMapById[zone_id]?.name ?? "";
		const area_name = locationMapById[area_id]?.name ?? "";
		const room_name = locationMapById[room_id]?.name ?? "";
		const row_name = locationMapById[row_id]?.name ?? "";
		const bay_name = locationMapById[bay_id]?.name ?? "";
		const level_name = locationMapById[level_id]?.name ?? "";
		const position_name = locationMapById[position_id]?.name ?? "";
		const bin_name = locationMapById[bin_id]?.name ?? "";

		const location_id =
			bin_id ||
			position_id ||
			level_id ||
			bay_id ||
			row_id ||
			room_id ||
			area_id ||
			zone_id ||
			warehouse_id ||
			branch_id ||
			region_id ||
			country_id;
		let supplier_type = DEFAULT_SUPPLIER_TYPE;
		let customer_type = DEFAULT_CUSTOMER_TYPE;

		if (company_supplier_id) {
			setSupplierType("company");
		} else if (person_supplier_id) {
			supplier_type = "person";
			setSupplierType("person");
		}

		if (company_customer_id) {
			setCustomerType("company");
		} else if (person_customer_id) {
			setCustomerType("person");
			customer_type = "person";
		}

		let supplier_id = company_supplier_id || person_supplier_id;
		let customer_id = company_customer_id || person_customer_id;
		const selItemType = itemTypes.find((it) => it.id == type_id);
		console.log("selected item types", selItemType);
		setItemTypeName(selItemType?.name ?? "");

		if (sku_id) {
			const selSKU = itemSKUs.find((it) => it.id === sku_id);
			selSKU &&
				selSKU.num_days_to_expire &&
				setDaysToExpireNum(selSKU.num_days_to_expire);
		}

		form.setFieldsValue({
			code: code,
			sku_id: sku_id,
			generic_code: generic_code,
			name: name,
			description: description,
			lot_number: lot_number,
			batch_number: batch_number,
			cost_center_id: cost_center_id,
			datetime_in: datetime_in ? dayjs(datetime_in, dateFormat) : "",
			manufacturing_date: manufacturing_date
				? dayjs(manufacturing_date, dateFormat)
				: "",
			slaughter_date: slaughter_date ? dayjs(slaughter_date, dateFormat) : "",
			production_date: production_date
				? dayjs(production_date, dateFormat)
				: "",
			processing_date: processing_date
				? dayjs(processing_date, dateFormat)
				: "",
			expiration_date: expiration_date
				? dayjs(expiration_date, dateFormat)
				: "",
			supplier_type: supplier_type,
			customer_type: customer_type,
			supplier_id: supplier_id,
			customer_id: customer_id,
			type_id,
			subtype_id,
			category_id,
			subcategory_id,
			top_handling_unit_id,
			top_handling_unit_qty: no_top_handling_unit, //top_handling_unit_qty,
			bottom_handling_unit_id,
			bottom_handling_unit_qty: no_bottom_handling_unit, //bottom_handling_unit_qty,
			regular_uom_id,
			// regular_net_qty_received,
			regular_net_qty_remaining,
			eaches_received_uom_id,
			eaches_remaining_uom_id,
			// eaches_net_qty_received,
			eaches_net_qty_remaining,
			fifo,
			fefo,
			accessCode,
			location_id: location_id,
			country_name: country_name,
			region_name: region_name,
			branch_name: branch_name,
			warehouse_name: warehouse_name,
			zone_name: zone_name,
			area_name: area_name,
			room_name: room_name,
			row_name: row_name,
			bay_name: bay_name,
			level_name: level_name,
			position_name: position_name,
			bin_name: bin_name,
		});
	}, [updatingCurrentItemInventory, locationMapById, itemTypes]);

	useEffect(() => {
		supplierType === "person"
			? setSupplierList(persons)
			: setSupplierList(companies);
		customerType === "person"
			? setCustomerList(persons)
			: setCustomerList(companies);
	}, [persons, companies, supplierType, customerType]);

	function getLocationMapping(location_code) {
		let mapped_location = {
			country_id: null,
			region_id: null,
			branch_id: null,
			warehouse_id: null,
			zone_id: null,
			area_id: null,
			room_id: null,
			row_id: null,
			bay_id: null,
			level_id: null,
			position_id: null,
			bin_id: null,
		};

		let location_id = locationMapByCode[location_code]?.id;
		let current_item_inventory_field =
			locationMapByCode[location_code]?.currentiteminventory_field;
		let parent_location_id =
			locationMapByCode[location_code]?.parent_location_id;

		if (location_id) {
			mapped_location[current_item_inventory_field] = location_id;

			while (parent_location_id) {
				let parent_location = locationMapById[parent_location_id];
				if (parent_location) {
					location_id = parent_location.id;
					current_item_inventory_field =
						parent_location.currentiteminventory_field;
					mapped_location[current_item_inventory_field] = location_id;
					parent_location_id = parent_location.parent_location_id;
				} else {
					parent_location_id = null;
				}
			}
		}
		return mapped_location;
	}

	const onSKUChange = (val) => {
		console.log(" when sku change ", val);
		const _sku = itemSKUs.find((it) => it.id === val);
		console.log("selected _sku ==>", _sku);
		if (_sku) {
			if (_sku.num_days_to_expire) {
				setDaysToExpireNum(parseInt(_sku.num_days_to_expire));

				const baseTypeName = form.getFieldValue("expiration_date_base_type");
				if (baseTypeName) {
					let baseDate = form.getFieldValue(baseTypeName);
					if (baseDate) {
						console.log(
							"expiration_date_base_type on SKU change====> ",
							baseDate
						);
						// Base date
						baseDate = dayjs(baseDate);
						// Add days to the base date
						const newDate = baseDate.add(
							parseInt(_sku.num_days_to_expire),
							"day"
						);
						form.setFieldsValue({
							expiration_date: dayjs(newDate, dateFormat),
						});
					}
				}
			}

			onItemTypeChange(_sku.type_id);

			form.setFieldsValue({
				type_id: _sku.type_id,
				subtype_id: _sku.subtype_id,
				category_id: _sku.category_id,
				subcategory_id: _sku.subcategory_id,
				fifo: _sku.fifo,
				fefo: _sku.fefo,
			});
		}
	};

	const onBaseDateChange = (val) => {
		console.log("on base date changed: val", val);
		const _baseDate = form.getFieldValue(val);
		// Base date
		const baseDate = dayjs(_baseDate);

		// Add days to the base date
		const newDate = baseDate.add(daysToExpireNum, "day");

		console.log("__baseDate ===> ", _baseDate);
		setExpirateMinDate(new Date(_baseDate));
		form.setFieldsValue({
			expiration_date: dayjs(newDate, dateFormat),
		});
	};

	const onLocationChange = (val) => {
		console.log("when location change", val);
		const _code = locationMapById[val]?.code;
		console.log("_code", _code);
		const locationMappedObj = getLocationMapping(_code);
		const {
			country_id,
			region_id,
			branch_id,
			warehouse_id,
			zone_id,
			area_id,
			room_id,
			row_id,
			bay_id,
			level_id,
			position_id,
			bin_id,
		} = locationMappedObj;

		const country_name = locationMapById[country_id]?.name ?? "";
		const region_name = locationMapById[region_id]?.name ?? "";
		const branch_name = locationMapById[branch_id]?.name ?? "";
		const warehouse_name = locationMapById[warehouse_id]?.name ?? "";
		const zone_name = locationMapById[zone_id]?.name ?? "";
		const area_name = locationMapById[area_id]?.name ?? "";
		const room_name = locationMapById[room_id]?.name ?? "";
		const row_name = locationMapById[row_id]?.name ?? "";
		const bay_name = locationMapById[bay_id]?.name ?? "";
		const level_name = locationMapById[level_id]?.name ?? "";
		const position_name = locationMapById[position_id]?.name ?? "";
		const bin_name = locationMapById[bin_id]?.name ?? "";

		console.log("locationMapppedObj ===>", locationMappedObj);

		form.setFieldsValue({
			country_name: country_name,
			region_name: region_name,
			branch_name: branch_name,
			warehouse_name: warehouse_name,
			zone_name: zone_name,
			area_name: area_name,
			room_name: room_name,
			row_name: row_name,
			bay_name: bay_name,
			level_name: level_name,
			position_name: position_name,
			bin_name: bin_name,
		});
	};

	const filterOption = (inputValue, option) => {
		return option.children.toLowerCase().includes(inputValue.toLowerCase());
	};

	const disabledDate = (current) => {
		const minDate = new Date(expirateMinDate); // Get today's date
		const currentDate = new Date(current); // Convert current date to a Date object
		// Disable dates before min date
		return currentDate < minDate;
	};

	const onFinish = async (values) => {
		try {
			console.log("Received values of form: ", values);
			const {
				code,
				sku_id,
				generic_code,
				name,
				description,
				lot_number,
				batch_number,
				cost_center_id,
				manufacturing_date,
				slaughter_date,
				production_date,
				processing_date,
				expiration_date,
				supplier_type,
				supplier_id, // company_customer_id or person_supplier_id
				customer_type,
				customer_id, // company_customer_id or person_customer_id
				type_id,
				subtype_id,
				category_id,
				subcategory_id,
				top_handling_unit_id,
				top_handling_unit_qty,
				bottom_handling_unit_id,
				bottom_handling_unit_qty,
				regular_uom_id,
				regular_net_qty_received,
				regular_net_qty_remaining,
				eaches_received_uom_id,
				eaches_remaining_uom_id,
				eaches_net_qty_received,
				eaches_net_qty_remaining,
				location_id,
				fifo,
				fefo,
				accessCode,
			} = values;
			const location_code = locationMapById[location_id]?.code;
			console.log("_code", location_code);
			const locationMappedObj = getLocationMapping(location_code);
			const {
				country_id,
				region_id,
				branch_id,
				warehouse_id,
				zone_id,
				area_id,
				room_id,
				row_id,
				bay_id,
				level_id,
				position_id,
				bin_id,
			} = locationMappedObj;

			const postPayload = {
				code,
				sku_id,
				name,
				description,
				generic_code,
				lot_number,
				batch_number,
				cost_center_id,
				manufacturing_date,
				slaughter_date,
				production_date,
				processing_date,
				expiration_date,
				company_supplier_id: supplier_type === "company" ? supplier_id : null,
				person_supplier_id: supplier_type === "person" ? supplier_id : null,
				company_customer_id: customer_type === "company" ? customer_id : null,
				person_customer_id: customer_type === "person" ? customer_id : null,
				type_id,
				subtype_id,
				category_id,
				subcategory_id,
				top_handling_unit_id,
				no_top_handling_unit: top_handling_unit_qty,
				bottom_handling_unit_id,
				no_bottom_handling_unit: bottom_handling_unit_qty,
				regular_uom_id,
				regular_net_qty_received,
				regular_net_qty_remaining,
				eaches_received_uom_id,
				eaches_net_qty_received,
				eaches_remaining_uom_id,
				eaches_net_qty_remaining,
				country_id,
				region_id,
				branch_id,
				warehouse_id,
				zone_id,
				area_id,
				room_id,
				row_id,
				bay_id,
				level_id,
				position_id,
				bin_id,
				fifo,
				fefo,
				accessCode,
				datetime_in: new Date(),
			};
			let resInv = {};
			if (isUpdating) {
				resInv = await CRUD(
					"put",
					CurrentItemInventoryUrl,
					{
						...postPayload,
						datetime_out: new Date(),
					},
					updatingCurrentItemInventory.id
				);
			} else {
				resInv = await CRUD("post", CurrentItemInventoryUrl, postPayload, null);
			}
			console.log("result of inventory", resInv);
			form.resetFields();
			history.push("/current_item_inventory");
		} catch (error) {
			console.log("[error] ===>", error);
		}
	};

	const handleDisabledDivClick = (e) => {
		console.log("event==========>", e.key);
		if (e.key === "Tab") {
			e.preventDefault(); // Prevent default tab navigation
		}
		if (true) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const checkDisabled = (fieldName) => {
		console.log("checking disabled ====>", fieldName);
		if (
			regularUOMFields.includes(fieldName) &&
			(itemTypeName === "regular" || itemTypeName === "assembly")
		) {
			form.setFieldsValue({
				eaches_net_qty_received: null,
				eaches_net_qty_remaining: null,
			});
			return false;
		}
		if (eachesUOMFields.includes(fieldName) && itemTypeName === "eaches") {
			form.setFieldsValue({
				regular_net_qty_received: null,
				regular_net_qty_remaining: null,
			});
			return false;
		}
		return true;
	};

	const onItemTypeChange = (value) => {
		console.log(" ****** value ====>", value);
		const selItemType = itemTypes.find((it) => it.id === value);
		console.log("***** value ====>", selItemType);
		if (selItemType) {
			setItemTypeName(selItemType.name);
		} else {
			setItemTypeName("");
		}
	};

	const onEmbeddedDeviceSelect = (key, value) => {
		form.setFieldsValue(key, value)
	}

	const handleQtyChange = (fieldName, updatedValue) => {
		if (fieldName === "regular_net_qty_received") {
			const _previousRemainigVal =
				previousFormValuesRef.current["regular_net_qty_remaining"] ?? 0;
			const _updatedRemaningValue = Math.max(
				_previousRemainigVal + updatedValue,
				0
			);
			console.log(
				"previous regular values ===>",
				_previousRemainigVal,
			);

			// previousFormValuesRef.current["regular_net_qty_remaining"] =
			//   _updatedRemaningValue;
			form.setFieldsValue({
				regular_net_qty_remaining: _updatedRemaningValue,
			});
		} else if (fieldName === "eaches_net_qty_received") {
			const _previousRemainigVal =
				// updatingCurrentItemInventory.eaches_net_qty_remaining
				previousFormValuesRef.current["eaches_net_qty_remaining"] ?? 0;
			const _updatedRemaningValue = Math.max(
				_previousRemainigVal + updatedValue,
				0
			);
			console.log(
				"previous regular values ===>",
				_previousRemainigVal,
			);
			// previousFormValuesRef.current["eaches_net_qty_remaining"] =
			//   _updatedRemaningValue;

			form.setFieldsValue({
				eaches_net_qty_remaining: _updatedRemaningValue,
			});
		}
		// previousFormValuesRef.current[fieldName] = updatedValue;
	};

	const formIntialValues = {
		supplier_type: DEFAULT_SUPPLIER_TYPE,
		expiration_date_base_type: null,
		customer_type: DEFAULT_CUSTOMER_TYPE,
	};

	return (
		<PageLayout title="Create / Update Item Inventory">
			<Form
				className="create-item-inventory-form"
				{...formItemLayout}
				form={form}
				name="CreateItemInventoryForm"
				onFinish={onFinish}
				initialValues={formIntialValues}
			>
				<Row gutter={[48, 32]} style={{ marginBottom: "16px" }}>
					<Col className="gutter-row" xs={24} sm={12} md={12} lg={8} xl={8}>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="code"
							label="Code"
							rules={[
								{
									required: true,
								},
							]}
						>
							<Input disabled={isUpdating ? true : false} />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="sku_id"
							label="SKU"
							rules={[{ required: true }]}
						>
							<Select
								showSearch
								onChange={onSKUChange}
								filterOption={filterOption}
							>
								{itemSKUs.map((sku) => {
									return (
										<Option value={sku.id} key={sku.id}>
											{sku.name}
										</Option>
									);
								})}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							labelWrap={true}
							name="generic_code"
							label="Purchase/Request Code"
						>
							<Input />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="name"
							label="Name"
						>
							<Input />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="description"
							label="Description"
						>
							<TextArea rows={6} />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="lot_number"
							label="Lot Code"
							rules={[
								{
									pattern: alphanumericPattern,
									message: "Please input alphanumeric characters only!",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="batch_number"
							label="Batch Code"
							rules={[
								{
									pattern: alphanumericPattern,
									message: "Please input alphanumeric characters only!",
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="cost_center_id"
							label="Cost Center"
						>
							<Select showSearch filterOption={filterOption}>
								{costCenters.map((cc) => {
									return (
										<Option value={cc.id} key={cc.id}>
											{cc.name}
										</Option>
									);
								})}
							</Select>
						</Form.Item>
						<Form.Item
							hidden
							colon={false}
							labelCol={{ span: 10 }}
							name="datetime_in"
							label="DateTime in"
						>
							<DatePicker format={dateFormat} hidden />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="manufacturing_date"
							label="Manufacturing Date"
						>
							<DatePicker format={dateFormat} />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="slaughter_date"
							label="Slaughter Date"
						>
							<DatePicker format={dateFormat} />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="production_date"
							label="Production Date"
						>
							<DatePicker format={dateFormat} />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="processing_date"
							label="Processing Date"
						>
							<DatePicker format={dateFormat} />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="expiration_date_base_type"
							label="Base Expiration Date From"
						>
							<Select
								placeholder="Please select the base date"
								onChange={onBaseDateChange}
							>
								<Option value="manufacturing_date"> Manufacturing Date </Option>
								<Option value="slaughter_date"> Slaughter Date </Option>
								<Option value="production_date"> Production Date </Option>
								<Option value="processing_date"> Processing Date </Option>
								<Option value="datetime_in"> DateTime In </Option>
							</Select>
						</Form.Item>
						{/* <Form.Item
              colon={false} 
              labelCol={{ span: 10 }}
              className="base-radio-group-field"
              name="expiration_date_base_type"
              label="Base Expiration Date From"
              rules={[{ required: true, message: "Please pick an item!" }]}
            >
              <Radio.Group>
                <Row gutter={[8, 2]}>
                  <Col span={12}>
                    <Radio.Button value="manufacturing_date">
                      Manufacturing
                    </Radio.Button>
                  </Col>
                  <Col span={12}>
                    <Radio.Button value="slaughter_date">
                      Slaughter
                    </Radio.Button>
                  </Col>
                  <Col span={12}>
                    <Radio.Button value="production_date">
                      Production
                    </Radio.Button>
                  </Col>
                  <Col span={12}>
                    <Radio.Button value="processing_date">
                      Processing
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item> */}
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="expiration_date"
							label="Expiration Date"
						>
							<DatePicker format={dateFormat} disabledDate={disabledDate} />
						</Form.Item>
						{/* <Form.Item
              colon={false} 
              labelCol={{ span: 10 }}
              name="datetime_in"
              label="DatetimeIn"
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              colon={false} 
              labelCol={{ span: 10 }}
              name="datetime_out"
              label="DatetimeOut"
            >
              <DatePicker />
            </Form.Item> */}
					</Col>

					<Col className="gutter-row" xs={24} sm={12} md={12} lg={8} xl={8}>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="supplier_type"
							label="Supplier / Vendor Entity"
						>
							<Select
								defaultValue={supplierType}
								placeholder="Please select a country"
								onChange={(val) => {
									setSupplierType(val);
									form.setFieldsValue({ supplier_id: undefined });
								}}
							>
								<Option value="company"> Company </Option>
								<Option value="person"> Person </Option>
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="supplier_id"
							label="Supplier / Vendor"
						>
							<Select showSearch filterOption={filterOption}>
								{supplierList.map((sp) => {
									return (
										<Option value={sp.id} key={sp.id}>
											{supplierType === "person" ? sp.user_name : sp.name}
										</Option>
									);
								})}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="customer_type"
							label="Customer / Client Entity"
						>
							<Select
								defaultValue={customerType}
								placeholder="Please select a country"
								onChange={(val) => {
									setCustomerType(val);
									form.setFieldsValue({ customer_id: undefined });
								}}
							>
								<Option value="company"> Company </Option>
								<Option value="person"> Person </Option>
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="customer_id"
							label="Customer / Client"
						>
							<Select showSearch filterOption={filterOption}>
								{customerList.map((sp) => {
									return (
										<Option value={sp.id} key={sp.id}>
											{customerType === "person" ? sp.user_name : sp.name}
										</Option>
									);
								})}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="type_id"
							label="Item Type"
						>
							<Select
								showSearch
								filterOption={filterOption}
								onChange={onItemTypeChange}
							>
								{itemTypes.map((type) => (
									<Option value={type.id} key={type.id}>
										{type.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="subtype_id"
							label="Item SubType"
						>
							<Select showSearch filterOption={filterOption}>
								{itemSubTypes.map((type) => (
									<Option value={type.id} key={type.id}>
										{type.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="category_id"
							label="Item Category"
						>
							<Select showSearch filterOption={filterOption}>
								{itemCategories.map((category) => (
									<Option value={category.id} key={category.id}>
										{category.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="subcategory_id"
							label="Item Sub Category"
						>
							<Select showSearch filterOption={filterOption}>
								{itemSubCategories.map((category) => (
									<Option value={category.id} key={category.id}>
										{category.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Row style={{ alignItems: "end" }}>
							<Col className="gutter-row" xs={24} sm={12}>
								<Form.Item
									colon={false}
									name="top_handling_unit_id"
									label="Top Handling Unit"
									wrapperCol={{ span: 20, offset: 4 }}
									labelCol={{ span: 20, offset: 4 }}
								>
									<Select showSearch filterOption={filterOption}>
										{handlingUnits.map((unit) => (
											<Option value={unit.id} key={unit.id}>
												{unit.name}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col className="gutter-row" xs={24} sm={12}>
								<Form.Item
									colon={false}
									wrapperCol={{ span: 20, offset: 4 }}
									labelCol={{ span: 20, offset: 4 }}
									name="top_handling_unit_qty"
									label="Quantity"
								>
									<InputNumber />
								</Form.Item>
							</Col>

							<Col className="gutter-row" xs={24} sm={12}>
								<Form.Item
									colon={false}
									wrapperCol={{ span: 20, offset: 4 }}
									labelCol={{ span: 20, offset: 4 }}
									name="bottom_handling_unit_id"
									label="Bottom Handling Unit"
								>
									<Select showSearch filterOption={filterOption}>
										{handlingUnits.map((unit) => (
											<Option value={unit.id} key={unit.id}>
												{unit.name}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col className="gutter-row" xs={24} sm={12}>
								<Form.Item
									colon={false}
									wrapperCol={{ span: 20, offset: 4 }}
									labelCol={{ span: 20, offset: 4 }}
									name="bottom_handling_unit_qty"
									label="Quantity"
								>
									<InputNumber />
								</Form.Item>
							</Col>
						</Row>
						<div
							className={
								itemTypeName === "regular" || itemTypeName === "assembly"
									? "form-sub-group-wrapper"
									: "form-sub-group-wrapper disabled-sub-group"
							}
							onClick={handleDisabledDivClick}
						>
							<span className="form-sub-group">
								{" "}
								&nbsp; For Regular Items &nbsp;{" "}
							</span>
							<Row>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="regular_uom_id"
										label="UOM IN / OUT"
									>
										<Select
											showSearch
											filterOption={filterOption}
											disabled={checkDisabled("regular_uom_id")}
											// onChange={e => setSelectedRegularInOutUOM(e.name)}
										>
											{itemUOMs.map((uom) => (
												<Option value={uom.id} key={uom.id}>
													{uom.name}
												</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="regular_net_qty_received"
										label="QTY Received"
									>
										<InputNumber
											onChange={(value) =>
												handleQtyChange("regular_net_qty_received", value)
											}
											disabled={checkDisabled("regular_uom_id")}
										/>
									</Form.Item>
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
									{/* {JSON.stringify({
										eachesSelectedEmbeddedDevice,regularSelectedEmbeddedDevice
									})}xx12xx */}
								<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										// name="regular_net_qty_remaining"
										label={regularSelectedEmbeddedDevice}
									>
									<SelectEmbededDevice onChange={val => onEmbeddedDeviceSelect('regular_embedded_device_id', val)} />
									</Form.Item>
								</Col>
							</Row>
							<Row>
								<Col className="gutter-row" xs={24} sm={8}>
								
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="regular_net_qty_remaining"
										label="QTY Remaining"
									>
										<InputNumber
											onChange={(value) =>
												handleQtyChange("regular_net_qty_remaining", value)
											}
											disabled={checkDisabled("regular_uom_id")}
										/>
									</Form.Item>
								</Col>
							</Row>
						</div>
						<div
							// className="form-sub-group-wrapper"
							className={
								itemTypeName === "eaches"
									? "form-sub-group-wrapper"
									: "form-sub-group-wrapper disabled-sub-group"
							}
							style={{ marginTop: "20px" }}
						>
							<span className="form-sub-group">
								&nbsp;For Items Dispensed in Eaches&nbsp;
							</span>
							<Row>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="eaches_received_uom_id"
										label="UOM IN"
									>
										<Select
											showSearch
											filterOption={filterOption}
											disabled={checkDisabled("eaches_received_uom_id")}
											// onChange={(e) => setSelectedRegularInOutUOM(e.name)}
										>
											{itemUOMs.map((uom) => (
												<Option value={uom.id} key={uom.id}>
													{uom.name}
												</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="eaches_net_qty_received"
										label="QTY Received"
									>
										<InputNumber
											onChange={(value) =>
												handleQtyChange("eaches_net_qty_received", value)
											}
											disabled={checkDisabled("eaches_net_qty_received")}
										/>
									</Form.Item>
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
								<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										// name="regular_net_qty_remaining"
										label={eachesSelectedEmbeddedDevice}
									>
									<SelectEmbededDevice onChange={val => onEmbeddedDeviceSelect('eaches_embedded_device_id', val)} />
									</Form.Item>
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="eaches_remaining_uom_id"
										label="UOM OUT"
									>
										<Select
											showSearch
											filterOption={filterOption}
											disabled={checkDisabled("eaches_remaining_uom_id")}
										>
											{itemUOMs.map((uom) => (
												<Option value={uom.id} key={uom.id}>
													{uom.name}
												</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col className="gutter-row" xs={24} sm={8}>
									<Form.Item
										colon={false}
										wrapperCol={{ span: 20, offset: 4 }}
										labelCol={{ span: 20, offset: 4 }}
										name="eaches_net_qty_remaining"
										label="QTY Remaining"
									>
										<InputNumber
											onChange={(value) =>
												handleQtyChange("eaches_net_qty_remaining", value)
											}
											disabled={checkDisabled("eaches_net_qty_remaining")}
										/>
									</Form.Item>
								</Col>
							</Row>
						</div>
					</Col>
					<Col className="gutter-row" xs={24} sm={12} md={12} lg={8} xl={8}>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="location_id"
							label="Location"
							rules={[
								{
									required: true,
									message: "Please select the Location Code",
								},
							]}
						>
							<Select
								showSearch
								style={{ width: relative }}
								onChange={onLocationChange}
								filterOption={filterOption}
							>
								{locationList?.map((location) => (
									<Option key={location.id} value={location.id}>
										{location.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="country_name"
							label="CountryId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="region_name"
							label="RegionId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="branch_name"
							label="BranchId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="warehouse_name"
							label="WarehouseId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="zone_name"
							label="ZoneId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="area_name"
							label="AreaId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="room_name"
							label="RoomId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="row_name"
							label="RowId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="bay_name"
							label="BayId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="level_name"
							label="LevelId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="position_name"
							label="PositionId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							className="location-form-item"
							labelCol={{ span: 10 }}
							name="bin_name"
							label="BinId"
						>
							<Input disabled />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="fifo"
							label="FIFO"
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="fefo"
							label="FEFO"
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							colon={false}
							labelCol={{ span: 10 }}
							name="accessCode"
							label="AccessCode"
							rules={[
								{
									required: true,
									message: "Please select an access code",
								},
							]}
						>
							<Select showSearch filterOption={filterOption}>
								{accessCodes?.map((item, index) => (
									<Option key={item.id} value={item.id}>
										{item.name}
									</Option>
								))}
							</Select>
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					colon={false}
					wrapperCol={{ span: 12, offset: 6 }}
					className="form-actions"
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

export default CreateCurrentItemInventory;
