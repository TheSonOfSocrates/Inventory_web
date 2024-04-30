import { Result, Spin } from "antd";
import { CheckCircleOutlined, LoadingOutlined , ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const LoadingPage = () => {
  let isLoading = useSelector((state) => state.loadingStatus.isLoading)
  const [loading, setLoading] = useState(false);
  useEffect(()=> {
    setLoading(isLoading);
  }, [isLoading, loading])
  return (
    <Result
      icon={loading ? <LoadingOutlined /> : <CheckCircleOutlined style={{ color: 'green' }} />}
      title={loading ? "System Loading In Progress" : "Loading Successful"}
      // subTitle="Loading initial data...It takes 5 - 10 seconds, please wait.."
      // extra={[isLoading ? <Spin size="large" /> : <CheckCircleOutlined />]}
    />
  );
};

export default LoadingPage;
