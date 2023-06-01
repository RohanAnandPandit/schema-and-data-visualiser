import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
  Alert,
  Button,
  Popconfirm,
  Popover,
  Space,
  Timeline,
  Typography,
} from "antd";
import { useStore } from "../../stores/store";
import { MdDelete } from "react-icons/md";

const { Title, Text } = Typography;

const QueryHistory = observer(() => {
  const rootStore = useStore();
  const settings = rootStore.settingsStore;
  const queriesStore = rootStore.queriesStore;
  const repositoryStore = rootStore.repositoryStore;

  useEffect(() => {
    repositoryStore.updateQueryHistory();
  }, [repositoryStore]);

  return (
    <Space
      direction="vertical"
      style={{ width: "100%", justifyContent: "center" }}
    >
      <Space
        style={{
          padding: 5,
          margin: "auto",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Title level={4}>Query History</Title>
        <DeleteHistory />
      </Space>
      {repositoryStore.getCurrentRepository() === null && (
        <Text style={{ padding: 5 }}>
          Select a repository to see the queries you have run in the past
        </Text>
      )}
      {repositoryStore.getCurrentRepository() &&
      repositoryStore.getQueryHistory().length === 0 ? (
        <div style={{ padding: 5 }}>
          <Alert message="There are no saved queries for this repository" />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: settings.screenHeight - 300,
            overflowY: "scroll",
          }}
        >
          <Timeline
            style={{ padding: 5, paddingTop: 10, maxWidth: "100%" }}
            items={repositoryStore
              .getQueryHistory()
              .map(({ id, sparql, date, title }) => {
                return {
                  children: (
                    <Popover
                      key={`query-${id}`}
                      placement="right"
                      title={`${title} (${date})`}
                      content={
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "consolas",
                          }}
                        >
                          {sparql}
                        </div>
                      }
                      trigger="hover"
                      style={{ width: "100%" }}
                    >
                      <Button
                        title="Click to open tab"
                        onClick={() => {
                          const qid = queriesStore.addQuery(sparql, title);
                          queriesStore.setCurrentQueryId(qid);
                        }}
                        style={{
                          height: "auto",
                          width: "100%",
                          whiteSpace: "normal",
                        }}
                      >
                        {title}
                      </Button>
                    </Popover>
                  ),
                };
              })}
          />
        </div>
      )}
    </Space>
  );
});

const DeleteHistory = observer(() => {
  const rootStore = useStore();
  const repositoryStore = rootStore.repositoryStore;

  return (
    <Popconfirm
      title={"Clear entire history"}
      description={`Are you sure?`}
      okText="Yes"
      cancelText="No"
      onConfirm={() => repositoryStore.clearQueryHistory()}
      style={{ justifyContent: "center" }}
      placement="top"
      disabled={repositoryStore.queryHistory.length === 0}
    >
      <Button
        danger
        disabled={repositoryStore.queryHistory.length === 0}
        title="Clear history"
      >
        <MdDelete size={20} />
      </Button>
    </Popconfirm>
  );
});

export default QueryHistory;
