import { Tabs, TabsProps } from "antd";
import { QueryResults } from "../../types";
import BarChart from "./BarChart";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores/store";
import { AiOutlineBarChart, AiOutlineRadarChart } from "react-icons/ai";
import { BsPieChart } from "react-icons/bs";
import { BiLineChart } from "react-icons/bi";
import { HiRectangleGroup } from "react-icons/hi2";
import { TbChartSankey } from 'react-icons/tb';
import { VscGraphScatter } from 'react-icons/vsc';
import PieChart from "./PieChart";
import LineChart from "./LineChart";
import TreeMap from "./TreeMap";
import RadarChart from "./RadarChart";
import SankeyChart from "./SankeyChart";
import ScatterChart from "./ScatterChart";

type ChartsProps = {
  results: QueryResults;
};

const Charts = ({ results }: ChartsProps) => {
  const settings = useStore().settingsStore;
  const chartWidth = Math.floor(
    (window.screen.width - settings.sidebarWidth) * 0.75
  );
  const chartHeight = 400;
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Recommended`,
      children: <></>,
    },
    {
      key: "2",
      label: (
        <>
          <AiOutlineBarChart size={20} /> Bar
        </>
      ),
      children: (
        <Tabs
          defaultActiveKey="1"
          items={results.header.slice(1).map((column, index) => {
            return {
              key: `${index}`,
              label: column,
              children: (
                <BarChart
                  results={results}
                  width={chartWidth}
                  height={chartHeight}
                  columnIndex={index + 1}
                />
              ),
            };
          })}
        />
      ),
    },
    {
      key: "3",
      label: (
        <>
          <BsPieChart size={18} /> Pie
        </>
      ),
      children: (
        <Tabs
          defaultActiveKey="1"
          items={results.header.slice(1).map((column, index) => {
            return {
              key: `${index}`,
              label: column,
              children: (
                <PieChart
                  results={results}
                  width={chartWidth}
                  height={chartHeight}
                  columnIndex={index + 1}
                />
              ),
            };
          })}
        />
      ),
    },
    {
      key: "4",
      label: (
        <>
          <BiLineChart size={18} /> Line
        </>
      ),
      children: (
        <Tabs
          defaultActiveKey="1"
          items={results.header.slice(1).map((column, index) => {
            return {
              key: `${index}`,
              label: column,
              children: (
                <LineChart
                  results={results}
                  width={chartWidth}
                  height={chartHeight}
                  columnIndex={index + 1}
                />
              ),
            };
          })}
        />
      ),
    },
    {
      key: "5",
      label: (
        <>
          <HiRectangleGroup size={18} /> Treemap
        </>
      ),
      children: (
        <Tabs
          defaultActiveKey="1"
          items={results.header.slice(1).map((column, index) => {
            return {
              key: `${index}`,
              label: column,
              children: (
                <TreeMap
                  results={results}
                  width={chartWidth}
                  height={chartHeight}
                  columnIndex={index + 1}
                />
              ),
            };
          })}
        />
      ),
    },
    {
      key: "6",
      label: (
        <>
          <AiOutlineRadarChart size={18} /> Radar
        </>
      ),
      children: (
        <RadarChart
          results={results}
          width={chartWidth}
          height={chartHeight}
          featureIndices={results.header
            .slice(1)
            .map((column, index) => index + 1)}
        />
      ),
    },
    {
      key: "7",
      label: (
        <>
          <TbChartSankey size={18} /> Sankey
        </>
      ),
      children: (
        <SankeyChart
          results={results}
          width={chartWidth}
          height={chartHeight}
        />
      ),
    },
    {
      key: "8",
      label: (
        <>
          <VscGraphScatter size={18} /> Scatter
        </>
      ),
      children: (
        <ScatterChart
          results={results}
          width={chartWidth}
          height={chartHeight}
        />
      ),
    },
  ];
  return <Tabs defaultActiveKey="1" items={items} />;
};

export default observer(Charts);
