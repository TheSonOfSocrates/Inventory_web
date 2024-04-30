import React from "react";
import { Layout, Menu, theme } from "antd";
const { Header, Content, Footer } = Layout;

const PageLayout = (props) => {
    const {titleRightAction, title, children }  = props;
//   const {
//     token: { colorBgContainer, borderRadiusLG },
//   } = theme.useToken();
  return (
    <Layout>
        <Header
            style={{
                paddingLeft: '16px',
                background: 'white',
            }}
        >
            {titleRightAction && titleRightAction()}
            <span style={{ margin: "0 8px" }} />
            <span className="page-main-title"> 
                {title}
            </span>
        </Header>
      <Content
        style={{
          margin: "24px 16px 24px",
          overflow: "initial",
        }}
      >
        <div
          style={{
            padding: 24,
            // textAlign: "center",
            background: 'white',
            borderRadius: '8px',
          }}
        >
          {children}
        </div>
      </Content>
      {/* <Footer
        style={{
          textAlign: "center",
        }}
      >
        {new Date().getFullYear()}
      </Footer> */}
    </Layout>
  );
};
export default PageLayout;
