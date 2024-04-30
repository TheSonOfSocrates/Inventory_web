import { useState, useEffect, useCallback } from "react";
import { PicLeftOutlined , ReloadOutlined } from "@ant-design/icons";
import { Row, Col, Button, Spin } from "antd";
import { Link } from "react-router-dom";
import { axiosRequest } from "../utils/functions";
import { SettingsStatusUrl } from "../utils/network";

const Home = () => {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading ? (
        <Spin />
      ) : (
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Row gutter={[10, 10]}>
            <Col span={12}>
              <Row gutter={[10, 10]}>
                <Col span={24}>
                  <Link to="/restock_details">
                    <Button
                      type="primary"
                      icon={<PicLeftOutlined style={{ fontSize: "24px" }} />}
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                        height: "250px",
                        color: "green",
                        border: "none",
                      }}
                    >
                      RestockItems
                    </Button>
                  </Link>
                </Col>
                <Col span={24}>
                  <Link to="restock_summary">
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                        height: "250px",
                        color: "green",
                        border: "none",
                      }}
                      icon={<PicLeftOutlined style={{ fontSize: "24px" }} />}
                    >
                      RestockSummary
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row gutter={[10, 10]}>
                <Col span={24}>
                  <Link to="/manual_daily_inventory_counts">
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                        height: "250px",
                        color: "green",
                        border: "none",
                      }}
                      icon={<PicLeftOutlined style={{ fontSize: "24px" }} />}
                    >
                      ManualCounts
                    </Button>
                  </Link>
                </Col>
                <Col span={24}>
                  <Link to="/automatic_daily_inventory_counts">
                    <Button
                      type="primary"
                      icon={<PicLeftOutlined style={{ fontSize: "24px" }} />}
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                        height: "250px",
                        color: "green",
                        border: "none",
                      }}
                    >
                      AutomaticCounts
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default Home;
