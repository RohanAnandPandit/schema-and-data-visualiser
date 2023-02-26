import React from "react";
import { Layout, theme } from "antd";
import QueryBrowser from "./QueryBrowser";
import Sidebar from "../../components/sidebar/Sidebar";

const { Content, Sider } = Layout;

const HomePage: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout>
      <Sider width={200} style={{ background: colorBgContainer }}>
        <Sidebar />
      </Sider>
      <Layout style={{ padding: "0 10px " }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            background: colorBgContainer,
          }}
        >
          <QueryBrowser />
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomePage;
