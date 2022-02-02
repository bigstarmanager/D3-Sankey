import React from "react";
import { SankeyNode } from "d3-sankey";
// import { SankeyDataLink, SankeyDataNode } from "./data";

import { SankeyDataLink, SankeyDataNode } from "./massageData";

export type NodeDataPoint = SankeyNode<SankeyDataNode, SankeyDataLink>;

interface SankeyNodeComponentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  title?: string;
}

const getCoordinates = (node: NodeDataPoint) => {
  const { x0, x1, y0, y1 } = node;
  const width = x0 !== undefined && x1 !== undefined ? x1 - x0 : undefined;
  const height = y0 !== undefined && y1 !== undefined ? y1 - y0 : undefined;

  return {
    x: x0,
    y: y0,
    width,
    height
  };
};

export const SankeyNodeComponent = ({
  color,
  title,
  ...rectProps
}: SankeyNodeComponentProps): JSX.Element => {
  return (
    <rect {...rectProps} fill={color}>
      {title && <title>{title}</title>}
    </rect>
  );
};

interface SankeyNodesComponentProps {
  nodes: NodeDataPoint[];
  titleFunc?(node: NodeDataPoint): string;
  colorFunc?(node: NodeDataPoint): string;
}

export const SankeyNodesComponent = ({
  nodes,
  titleFunc,
  colorFunc
}: SankeyNodesComponentProps): JSX.Element => {
  return (
    <g stroke="#000">
      {nodes.map((node) => {
        const coords = getCoordinates(node);
        return (
          <SankeyNodeComponent
            {...coords}
            key={node.name}
            color={colorFunc?.(node)}
            title={titleFunc?.(node)}
          />
        );
      })}
    </g>
  );
};
