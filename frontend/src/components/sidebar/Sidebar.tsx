import React, { useEffect, useState } from "react";
import { Button, Divider, Dropdown, Popover, Space } from "antd";
import { allRepositories } from "../../api/graphdb";
import { useStore } from "../../stores/store";
import { RepositoryInfo } from "../../types";
import { observer } from "mobx-react-lite";
import { Typography } from "antd";

const { Title, Text } = Typography;

const Sidebar = observer(() => {
  const rootStore = useStore();
  const repositoryStore = rootStore.repositoryStore;

  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);

  useEffect(() => {
    allRepositories().then((repositories) => setRepositories(repositories));
  }, []);

  return (
    <div style={{ justifyContent: "center" }}>
      <Dropdown
        menu={{
          items: repositories.map(({ id, title }: RepositoryInfo, index) => {
            return {
              key: `${index}`,
              label: (
                <Popover
                  placement="right"
                  title={title ? "Description" : "No description available"}
                  content={title}
                  trigger="hover"
                >
                  <Button
                    onClick={() => repositoryStore.setCurrentRepository(id)}
                    style={{ width: "100%", height: "100%" }}
                  >
                    {id}
                  </Button>
                </Popover>
              ),
            };
          }),
        }}
      >
        <Button style={{ width: "95%", margin: 5 }}>
          <b>{repositoryStore.getCurrentRepository() || "Select repository"}</b>
        </Button>
      </Dropdown>
      <Divider />
      <QueryHistory />
    </div>
  );
});

const QueryHistory = observer(() => {
  const rootStore = useStore();
  const repositoryStore = rootStore.repositoryStore;

  useEffect(() => {
    repositoryStore.updateQueryHistory();
  }, [repositoryStore]);

  return (
    <div
      style={{
        width: "100%",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title level={4} style={{ margin: "auto", marginBottom: 5 }}>
        History
      </Title>
      {repositoryStore.getCurrentRepository() === null && (
        <Text style={{ padding: 5 }}>
          Select a repository to see the queries you have run in the past
        </Text>
      )}
      {repositoryStore.getCurrentRepository() && repositoryStore.getQueryHistory().length === 0 && (
        <Text style={{ padding: 5 }}>
          There are no queries for this repository
        </Text>
      )}
      <Space
        style={{
          height: 500,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {repositoryStore.getQueryHistory().map(({ id, sparql, repositoryId, date }) => (
          <Popover
            key={`query-${id}`}
            placement="right"
            title={`Repository: ${repositoryId}`}
            content={<div style={{ whiteSpace: "pre-line" }}>{sparql}</div>}
            trigger="hover"
          >
            <Button onClick={() => {}}>{date}</Button>
          </Popover>
        ))}
      </Space>
    </div>
  );
});

export default Sidebar;
