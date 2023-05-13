import { useEffect, useState } from "react";
import { Descriptions, Skeleton, Tag } from "antd";
import { Metadata, RepositoryId, URI } from "../../types";
import { getMetaInformation, getType } from "../../api/dataset";
import { removePrefix } from "../../utils/queryResults";

type MetaInfoProps = {
  repository: RepositoryId;
  uri: URI;
};
export const MetaInfo = ({ repository, uri }: MetaInfoProps) => {
  const [metadata, setMetadata] = useState<Metadata>({
    comment: "",
    label: "",
    range: "",
    domain: "",
  });
  const [types, setTypes] = useState<URI[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getMetaInformation(repository, uri).then((res: Metadata) => {
      setMetadata(res);
      setLoading(false);
    });
    getType(repository, uri).then((res: URI[]) => {
      setTypes(res);
    });
  }, [repository, uri]);

  return (
    <Skeleton loading={loading}>
      <Descriptions size="small" bordered>
        {types.length > 0 && (
          <Descriptions.Item key="type" label="Type">
            {types.map((t, index) => (
              <Tag key={`type-${index}`}>{removePrefix(t)}</Tag>
            ))}
          </Descriptions.Item>
        )}

        {Object.keys(metadata).map(
          (field: string) =>
            (metadata as any)[field].trim() && (
              <Descriptions.Item key={field} label={field}>
                {removePrefix((metadata as any)[field])}
              </Descriptions.Item>
            )
        )}
      </Descriptions>
    </Skeleton>
  );
};
