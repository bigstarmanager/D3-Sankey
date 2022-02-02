import React from "react";
import { NodeDataPoint } from "./SankeyNodes";

interface SankeyLabelProps {
  x: number;
  y: number;
  dy: string;
  textAnchor?: "start" | "middle" | "end";
  text: string;
}

export const SankeyNodeLabelComponent = ({
  text,
  ...textProps
}: SankeyLabelProps): JSX.Element => {
  return (
    <text {...textProps} fontWeight="bold">
      {text}
    </text>
  );
};

export const isFilledSankeyNode = (
  node: NodeDataPoint
): node is Required<NodeDataPoint> => {
  return (
    node.x0 !== undefined &&
    node.x1 !== undefined &&
    node.y0 !== undefined &&
    node.y1 !== undefined
  );
};

const getTextProps = (
  { x0, x1, y0, y1 }: Required<NodeDataPoint>,
  width: number
) => {
  const x = (x1 + x0) / 2;
  const y = (y1 + y0) / 2;

  // const textAnchor = x0 < width / 2 ? "start" : "end";
  const textAnchor = "middle";

  return {
    x,
    y,
    textAnchor,
    dy: "0.35em"
  } as const;
};

interface SankeyNodeLabelsProps {
  nodes: NodeDataPoint[];
  width: number;
  textFunc?(node: NodeDataPoint): string;
}

export const SankeyNodeLabelsComponent = ({
  nodes,
  width,
  textFunc
}: SankeyNodeLabelsProps): JSX.Element => {
  return (
    <g style={{ fontSize: 10 }}>
      {nodes.map((node) => {
        if (!isFilledSankeyNode(node)) return null;
        const textProps = getTextProps(node, width);

        const text = textFunc?.(node) || node.tokenData.address;

        return (
          <SankeyNodeLabelComponent
            {...textProps}
            text={text}
            key={node.name}
          />
        );
      })}
    </g>
  );
};
