import React from "react";
import { Layout, theme, Tabs, TabsProps } from "antd";
import { AiOutlineDotChart } from "react-icons/ai";
import { TbVectorTriangle } from "react-icons/tb";
import QueryEditor from "../../components/query-editor/QueryEditor";
import VisualiseResults from "../../components/visualise-results/VisualiseResults";
import Sidebar from "../../components/sidebar/Sidebar";

const { Content, Sider } = Layout;

const items: TabsProps["items"] = [
  {
    key: "1",
    label: (
      <>
        <TbVectorTriangle size={20} style={{ margin: 5 }} /> SPARQL query
      </>
    ),
    children: <QueryEditor />,
  },
  {
    key: "2",
    label: (
      <>
        <AiOutlineDotChart size={20} style={{ margin: 5 }} />
        Visualise results
      </>
    ),
    children: <VisualiseResults />,
  },
];

const HomePage: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout>
      <Sider width={200} style={{ background: colorBgContainer }}>
        <Sidebar />
      </Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            background: colorBgContainer,
          }}
        >
          <Tabs items={items} onChange={() => {}} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomePage;