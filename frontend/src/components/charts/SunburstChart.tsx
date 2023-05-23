import React from "react";
import { LabelSeries, Sunburst } from "react-vis";
import { QueryResults, VariableCategories } from "../../types";
import randomColor from "randomcolor";
import { shadeColor } from "../../utils/queryResults";
import { Alert, Breadcrumb, Divider, Space, Typography } from "antd";

type SunburstProps = {
  results: QueryResults;
  width: number;
  height: number;
  variables: VariableCategories;
};

// export const SunburstChart = observer(
//   ({ results, width, height, variables }: SunburstProps) => {
const LABEL_STYLE = {
  fontSize: "15px",
  textAnchor: "middle",
};

/**
 * Recursively work backwards from highlighted node to find path of valud nodes
 * @param {Object} node - the current node being considered
 * @returns {Array} an array of strings describing the key route to the current node
 */
function getKeyPath(node) {
  if (!node.parent) {
    return ["root"];
  }

  return [(node.data && node.data.name) || node.name].concat(
    getKeyPath(node.parent)
  );
}

/**
 * Recursively modify data depending on whether or not each cell has been selected by the hover/highlight
 * @param {Object} data - the current node being considered
 * @param {Object|Boolean} keyPath - a map of keys that are in the highlight path
 * if this is false then all nodes are marked as selected
 * @returns {Object} Updated tree structure
 */
function updateData(data, keyPath) {
  if (data.children) {
    data.children.map((child) => updateData(child, keyPath));
  }
  // add a fill to all the uncolored cells
  if (!data.hex) {
    data.style = {
      fill: randomColor(), //EXTENDED_DISCRETE_COLOR_RANGE[5],
    };
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1,
  };

  return data;
}

class SunburstChart extends React.Component<SunburstProps, any> {
  state: any = {
    path: null,
    decoratedData: {},
    data: {},
    finalValue: false,
    clicked: false,
    titleSizes: {},
  };

  componentDidMount(): void {
    const { data, titleSizes } = updateData(
      getHierarchicalData(
        this.props.results,
        this.props.variables.key,
        this.props.variables.scalar[0]
      ),
      false
    );
    this.setState({
      path: null,
      decoratedData: data,
      data,
      clicked: false,
      titleSizes,
    });
  }

  render() {
    const { clicked, data, finalValue, path, titleSizes } = this.state;
    return (
      <div className="basic-sunburst-example-wrapper">
        <div>
          <Space>
            <Alert type="info" message="Click to lock/unlock selection" />
            <Divider type="vertical" />

            {path && (
              <Breadcrumb
                style={{ fontSize: 20 }}
                separator=">"
                items={path.map((title: string) => {
                  return { title };
                })}
              />
            )}
          </Space>
        </div>
        <Sunburst
          animation
          className="basic-sunburst-example"
          hideRootNode
          onValueMouseOver={(node) => {
            if (clicked) {
              return;
            }
            const path = getKeyPath(node).reverse();
            const pathAsMap = path.reduce((res, row) => {
              res[row] = true;
              return res;
            }, {});
            this.setState({
              finalValue: path[path.length - 1],
              path: path.slice(1),
              data: updateData(this.state.decoratedData, pathAsMap),
            });
          }}
          onValueMouseOut={() =>
            clicked
              ? () => {}
              : this.setState({
                  path: null,
                  finalValue: false,
                  data: updateData(this.state.decoratedData, false),
                })
          }
          onValueClick={() => this.setState({ clicked: !clicked })}
          style={{
            stroke: "#ddd",
            strokeOpacity: 0.3,
            strokeWidth: "0.5",
          }}
          colorType="literal"
          getSize={(d) => d.value}
          getColor={(d) => d.hex}
          data={data}
          height={this.props.height - 75}
          width={this.props.width}
        >
          <LabelSeries
            data={[
              {
                x: 0,
                y: 0,
                label: finalValue
                  ? `${finalValue}: ${titleSizes[finalValue].toLocaleString()}`
                  : "Hover over cell for details",
                style: LABEL_STYLE,
              },
            ]}
            style={{ fontSize: 20 }}
          />
        </Sunburst>
      </div>
    );
  }
}
export function getHierarchicalData(
  results: QueryResults,
  keyColumns: string[],
  sizeColumn: string
): any {
  const titleSizes = {};
  const sizeIndex = results.header.indexOf(sizeColumn);
  let dataFromTitle: any = {};

  for (let row of results.data) {
    const column = keyColumns.at(-1)!;
    const titleIndex = results.header.indexOf(column);
    const title = row[titleIndex];
    const value = parseFloat(row[sizeIndex]);
    const hex = randomColor({ luminosity: "light" });
    // Leaf node contains title and size but no children
    dataFromTitle[row[titleIndex]] = {
      name: title,
      value,
      hex,
      style: {
        border: "thin solid black",
      },
    };
    titleSizes[title] = value;
  }

  for (let i = keyColumns.length - 1; i > 0; i--) {
    const parentTitle = keyColumns[i - 1];
    const parentTitleIndex = results.header.indexOf(parentTitle);

    const childTitle = keyColumns[i];
    const childTitleIndex = results.header.indexOf(childTitle);

    const newDataFromTitle = {}; // Data with previous column as key
    const parentChildren = {};
    for (let row of results.data) {
      const parentValue = row[parentTitleIndex];
      const childValue = row[childTitleIndex];
      parentChildren[parentValue] = parentChildren[parentValue] ?? new Set();
      parentChildren[parentValue].add(childValue);
    }

    for (let parentValue of Object.keys(parentChildren)) {
      newDataFromTitle[parentValue] = newDataFromTitle[parentValue] ?? {
        name: parentValue,
        children: [],
        style: {
          border: "thin solid black",
        },
      };
      titleSizes[parentValue] = 0;
      const parentData = newDataFromTitle[parentValue];
      let groupColour = "";
      for (let childValue of parentChildren[parentValue]) {
        const childData = dataFromTitle[childValue];

        if (parentData.children.length > 0) {
          groupColour = parentData.children[0].color;
          childData.color = groupColour;
        }

        parentData.children.push(childData);
        titleSizes[parentValue] += childData.value; // Increment parent's size using child for circle packing
      }
      parentData.hex = shadeColor(
        groupColour ? groupColour : randomColor({ luminosity: "light" }),
        -20
      );
    }

    dataFromTitle = newDataFromTitle;
  }
  const children: any[] = Object.values(dataFromTitle);
  const label = keyColumns[0];
  const totalValue = children
    .map((child: any) => child.value)
    .reduce((a, b) => a + b, 0);

  titleSizes[label] = totalValue;

  const data = {
    name: label, // Text to show hierarchy of columns
    children,
    // color: shadeColor(children[0].color, -30),
  };

  return { data, titleSizes };
}

export default SunburstChart;
