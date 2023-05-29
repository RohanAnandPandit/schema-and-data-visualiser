import {
  Bar,
  BarChart as BarRechart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QueryResults, VariableCategories } from "../../types";
import { removePrefix } from "../../utils/queryResults";
import { Tabs } from "antd";

type BarChartProps = {
  results: QueryResults;
  variables: VariableCategories;
  width: number;
  height: number;
};

const BarChart = ({ results, width, height, variables }: BarChartProps) => {
  const tabHeight = 60;
  return (
    <Tabs
      defaultActiveKey="1"
      items={variables.numeric.map((column, id) => {
        const keyIndex = results.header.indexOf(variables.key[0]);
        const columnIndex = results.header.indexOf(column);

        const data = results.data.map((row) => {
          const bar: any = { name: removePrefix(row[keyIndex]) };

          bar[column] = parseFloat(row[columnIndex]);
          return bar;
        });

        return {
          key: `column-${id}`,
          label: column,
          children: (
            <ResponsiveContainer width="100%" height={height - tabHeight}>
              <BarRechart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={results.header[columnIndex]} fill="#8884d8" />
              </BarRechart>
            </ResponsiveContainer>
          ),
        };
      })}
    />
  );
};

export default BarChart;
