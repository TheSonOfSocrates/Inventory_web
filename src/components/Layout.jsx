import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import Logo from "../assets/logo.svg";
import User from "../assets/user.svg";
import { logout } from "../utils/js_functions";
import { Link } from "react-router-dom";
import {
  UsergroupAddOutlined,
  SettingOutlined,
  TableOutlined,
  MailOutlined,
  ClusterOutlined,
  EnvironmentOutlined,
  HddOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FolderViewOutlined,
} from "@ant-design/icons";
import { Button, Menu, Modal, Layout } from "antd";
import { getPerms } from "../utils/js_functions";
import { useSelector } from "react-redux";
import UserProfileModal from "../utils/user_profile_modal";
import Loading from "../utils/loadingPage";
import UpdatePassword from "../utils/update_password";

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}
const { Sider } = Layout;
const rootMenuKeys = ["sub6", "sub1", "sub2", "sub3"];

const MainLayout = ({ children }) => {
  let user = JSON.parse(localStorage.getItem("currentUser"));
  let perms = useSelector((state) => state.settings.rolesAndPermissions);

  console.log("perms==================================>>>>>>", perms)
  let userPerm = getPerms(perms);
  localStorage.setItem("userPerm", JSON.stringify(userPerm));
  const headerHeight = "80px";

  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  

  const location = useLocation();
  const { pathname } = location;
  console.log("=====> pathname", pathname);

  const isLoading = useSelector((state) => state.loadingStatus.isLoading);

  useEffect(() => {
    // Extract the key from the pathname and update the selectedKeys state
    const key = pathname.substring(1); // Remove the leading '/'
    setSelectedKeys([key]);
  }, [pathname]);

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootMenuKeys.includes(latestOpenKey)) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  };

  console.log("userPerm.perm_read_main", userPerm);

  let items = [
    // getItem(<Link to="/">Dashboard</Link>, "1", <AppstoreOutlined />),
    userPerm.perm_read_main === "1"
      ? getItem("MainTable", "sub6", <TableOutlined />, [
          // getItem(
          //   <Link to="/current_item_inventory">Current Item Inventory</Link>,
          //   'current_item_inventory',
          //   <MailOutlined />
          // ),
          getItem(
            "Current Item Inventory",
            "CurrentItemInventory",
            <MailOutlined />,
            [
              getItem(
                <Link to="/create_current_item_inventory">
                  Create / Update
                </Link>,
                "create_current_item_inventory",
                <MailOutlined />
              ),
              getItem(
                <Link to="/current_item_inventory"> View </Link>,
                "current_item_inventory",
                <MailOutlined />
              ),
            ]
          ),
          getItem("Item BOM / Assembly", "sub7", <MailOutlined />, [
            getItem(
              <Link to="/create_item_BOM">Create / Update</Link>,
              "create_item_BOM",
              <MailOutlined />
            ),
            getItem(
              <Link to="/itemBOM">View</Link>,
              "itemBOM",
              <MailOutlined />
            ),
          ]),
          userPerm.perm_read_restock === "1"
            ? getItem("Restocking", "Restocking", <MailOutlined />, [
                getItem(
                  <Link to="/create_restock">Create / Update</Link>,
                  "create_restock",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/view_restock">View</Link>,
                  "view_restock",
                  <FolderViewOutlined />
                ),
              ])
            : null,
          // getItem(
          //   <Link to="/manual_daily_inventory_counts">
          //     Manual Daily Inventory Counts
          //   </Link>,
          //   '43',
          //   <MailOutlined />
          // ),
          // getItem(
          //   <Link to="/automatic_daily_inventory_counts">
          //     Automatic Daily Inventory Counts
          //   </Link>,
          //   '44',
          //   <MailOutlined />
          // ),
          getItem(
            <Link to="/daily_inventory_counts">Daily Inventory Counts</Link>,
            "daily_inventory_counts",
            <MailOutlined />
          ),
          // getItem(
          //   <Link to="/discrepancy">Discrepancy</Link>,
          //   '60',
          //   <MailOutlined />
          // ),
          getItem(
            <Link to="/disposal_inventory">DisposalInventory</Link>,
            "disposal_inventory",
            <MailOutlined />
          ),
          getItem(
            <Link to="/inbound_registration">Inbound Registration</Link>,
            "inbound_registration",
            <MailOutlined />
          ),
          getItem(
            <Link to="/outbound_registration">Outbound Registration</Link>,
            "outbound_registration",
            <MailOutlined />
          ),
        ])
      : null,
    userPerm.perm_read_entities === "1"
      ? getItem("Entities", "sub1", <UsergroupAddOutlined />, [
          getItem("Person", "EntityPersons", <MailOutlined />, [
            getItem(
              <Link to="/create_person">Create / Update</Link>,
              "create_person",
              <MailOutlined />
            ),
            getItem(
              <Link to="/persons"> View </Link>,
              "persons",
              <MailOutlined />
            ),
          ]),
          getItem("Company", "EntityCompanies", <MailOutlined />, [
            getItem(
              <Link to="/create_company">Create / Update</Link>,
              "create_company",
              <MailOutlined />
            ),
            getItem(
              <Link to="/companies"> View </Link>,
              "companies",
              <MailOutlined />
            ),
          ]),
          getItem("ItemSKU", "EntityItemSKU", <MailOutlined />, [
            getItem(
              <Link to="/create_itemSKU">Create / Update</Link>,
              "create_itemSKU",
              <MailOutlined />
            ),
            getItem(
              <Link to="/itemSKU"> View </Link>,
              "itemSKU",
              <MailOutlined />
            ),
          ]),
          getItem("Embedded Device", "EntityEmbeddedDevice", <MailOutlined />, [
            getItem(
              <Link to="/create_embedded_device">Create / Update</Link>,
              "create_embedded_device",
              <MailOutlined />
            ),
            getItem(
              <Link to="/embedded_device"> View </Link>,
              "embedded_device",
              <MailOutlined />
            ),
          ]),
          // getItem(
          //   <Link to="/embedded_device">Embedded Device</Link>,
          //   "embedded_device",
          //   <MailOutlined />
          // ),
          getItem(
            <Link to="/vehicle">Vehicle</Link>,
            "vehicle",
            <MailOutlined />
          ),
        ])
      : null,
    userPerm.perm_read_utilities === "1"
      ? getItem("Utilities", "sub2", <ClusterOutlined />, [
          getItem(
            <Link to="/direct_label_printing">Direct Label Printing</Link>,
            "direct_label_printing",
            <MailOutlined />
          ),
          getItem(
            <Link to="/settings_generic_config">Web Settings</Link>,
            "settings_generic_config",
            <MailOutlined />
          ),
        ])
      : null,
    userPerm.perm_read_settings === "1"
      ? getItem("Settings", "sub3", <SettingOutlined />, [
          getItem("General", "sub4", <HddOutlined />, [
            getItem(
              <Link to="/settings_status">Status</Link>,
              "settings_status",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_access_code">AccessCodes</Link>,
              "settings_access_code",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_reasons">Reasons</Link>,
              "settings_reasons",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_reasons_type">ReasonsType</Link>,
              "settings_reasons_type",
              <MailOutlined />
            ),
            getItem(
              "Roles And Permissions",
              "RolesAndPermissions",
              <MailOutlined />,
              [
                getItem(
                  <Link to="/create_settings_roles_and_permissions">
                    Create / Update
                  </Link>,
                  "create_settings_roles_and_permissions",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_roles_and_permissions"> View </Link>,
                  "settings_roles_and_permissions",
                  <MailOutlined />
                ),
              ]
            ),
            // getItem(
            //   <Link to="/settings_roles_and_permissions">
            //     Roles And Permissions
            //   </Link>,
            //   "settings_roles_and_permissions",
            //   <MailOutlined />
            // ),
            getItem(
              <Link to="/settings_currency">Currency</Link>,
              "settings_currency",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_transfer_type">Transfer Type</Link>,
              "settings_transfer_type",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_cost_center">Cost Center</Link>,
              "settings_cost_center",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_reports">Reports</Link>,
              "settings_reports",
              <MailOutlined />
            ),

            getItem(
              <Link to="/settings_company_type">Company Type</Link>,
              "settings_company_type",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_item_category">Item Category</Link>,
              "settings_item_category",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_item_sub_category">Item SubCategory</Link>,
              "settings_item_sub_category",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_item_type">Item Type</Link>,
              "settings_item_type",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settings_item_sub_type">Item SubType</Link>,
              "settings_item_sub_type",
              <MailOutlined />
            ),
            getItem(
              <Link to="/settingsUOM">UOM</Link>,
              "settingsUOM",
              <MailOutlined />
            ),

            getItem(
              <Link to="/settings_handle_unit">Handling Unit</Link>,
              "settings_handle_unit",
              <MailOutlined />
            ),
          ]),
          userPerm.perm_read_location === "1"
            ? getItem("Location", "sub5", <EnvironmentOutlined />, [
                getItem(
                  <Link to="/settings_location_country_type">
                    Country Type
                  </Link>,
                  "settings_location_country_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_country">Country</Link>,
                  "settings_location_country",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_region_type">Region Type</Link>,
                  "settings_location_region_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_region">Region</Link>,
                  "settings_location_region",
                  <MailOutlined />
                ),

                getItem(
                  <Link to="/settings_location_branch_type">Branch Type</Link>,
                  "settings_location_branch_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_branch">Branch</Link>,
                  "settings_location_branch",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_warehouse_type">
                    Warehouse Type
                  </Link>,
                  "settings_location_warehouse_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_warehouse">Warehouse</Link>,
                  "settings_location_warehouse",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_zone_type">Zone Type</Link>,
                  "settings_location_zone_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_zone">Zone</Link>,
                  "settings_location_zone",
                  <MailOutlined />
                ),

                getItem(
                  <Link to="/settings_location_area_type">Area Type</Link>,
                  "settings_location_area_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_area">Area</Link>,
                  "47",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_room_type">Room Type</Link>,
                  "settings_location_room_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_room">Room</Link>,
                  "settings_location_room",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_row_type">Row Type</Link>,
                  "settings_location_row_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_row">Row</Link>,
                  "settings_location_row",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_bay_type">Bay Type</Link>,
                  "settings_location_bay_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_bay">Bay</Link>,
                  "settings_location_bay",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_level_type">Level Type</Link>,
                  "settings_location_level_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_level">Level</Link>,
                  "settings_location_level",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_position_type">
                    Position Type
                  </Link>,
                  "settings_location_position_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_position">Position</Link>,
                  "settings_location_position",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_bin_type">Bin Type</Link>,
                  "settings_location_bin_type",
                  <MailOutlined />
                ),
                getItem(
                  <Link to="/settings_location_bin">Bin</Link>,
                  "settings_location_bin",
                  <MailOutlined />
                ),
              ])
            : null,
        ])
      : null,
  ];
  const [visible, setVisible] = useState(false);
  const openProfileModal = () => {
    setVisible(true);
  };

  console.log("selectedKeys===========", selectedKeys)
  return (
    <div className="layout">
      <Modal title="Loading Data" open={isLoading} footer={null}>
        <Loading />
      </Modal>

      <div className="header">
        <div className="brand">
          {/* <img src={Logo}
                    alt="logo"/> */}
          <span
            style={{
              color: "#ffffff",
              fontSize: "20px",
              fontFamily: "cursive",
            }}
          >
            Virginia General Inventory System
          </span>
        </div>
        <div className="rightNav">
          <div className="userAvatar">
            <img src={User} alt="user" />
            <div className="text">
              <Button
                onClick={openProfileModal}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                {user ? user.user_name : "user"}
              </Button>
            </div>
          </div>
          <div className="rightItem">
            <div className="logoutButton">
              <div className="text" onClick={logout}>
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="bodyHolder"
        style={{ minHeight: `calc(100vh - ${headerHeight})` }}
      >
        <Modal
          title={"User Profile"}
          open={visible}
          onCancel={() => setVisible(false)}
          footer={null}
        >
          <div style={{ marginTop: "25px", marginRight: "30px" }}>
            <UserProfileModal />
            <UpdatePassword />
          </div>
        </Modal>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            height: `calc(100vh - ${headerHeight})`,
            // position: 'fixed',
            left: 0,
          }}
          width={280}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {!collapsed && <div style={{ marginLeft: "25px" }}> Menu </div>}
            <div
              style={{
                margin: "15px 25px 15px 25px",
                marginRight: `${collapsed ? "" : "10px"}`,
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 30,
                  height: 30,
                }}
              />
            </div>
          </div>
          <hr
            style={{ margin: "0", border: "0", borderTop: "1px solid #ccc" }}
          />
          <Menu
            style={{ marginTop: "10px" }}
            mode="inline"
            items={items}
            openKeys={openKeys}
            // openKeys={['sub3', 'sub4']}
            // setSelectedKeys={selectedKeys ? true: false}
            selectedKeys={selectedKeys}
            onOpenChange={onOpenChange}
          />
        </Sider>
        <div className="mainContent card-layout">{children} </div>
      </div>
    </div>
  );
};

export default MainLayout;
