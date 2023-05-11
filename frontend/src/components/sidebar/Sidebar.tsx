import React, { useEffect, useState } from "react";
import { Button, Divider, Dropdown, Popover, Space } from "antd";
import { allRepositories } from "../../api/graphdb";
import { useStore } from "../../stores/store";
import { RepositoryInfo } from "../../types";
import { observer } from "mobx-react-lite";
import { RiGitRepositoryLine } from "react-icons/ri";
import QueryHistory from "./QueryHistory";
import ExploreDataset from "./ExploreDataset";

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
        <Button style={{ width: "95%", margin: 5 }} title="Choose repository">
          <Space>
            <RiGitRepositoryLine size={20} />
            <b>{repositoryStore.currentRepository || "Select repository"}</b>
          </Space>
        </Button>
      </Dropdown>

      <ExploreDataset repository={repositoryStore.currentRepository} />
      <Divider />
      <QueryHistory />
    </div>
  );
});

export default Sidebar;
