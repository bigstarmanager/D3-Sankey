import React from "react";
import { LinkDataPoint } from "./SankeyLinks";
import { NodeDataPoint } from "./SankeyNodes";
import { formatLinkTextFunc } from "./parse";
import { isFilledSankeyNode } from "./SankeyNodeLabels";

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
  return <text {...textProps}>{text}</text>;
};

interface FilledSankeyLinkProps {
  source: Required<NodeDataPoint>;
  target: Required<NodeDataPoint>;
  y0: number;
  y1: number;
}

const isFilledSankeyLink = (
  link: LinkDataPoint
): link is LinkDataPoint & FilledSankeyLinkProps => {
  return (
    typeof link.source === "object" &&
    isFilledSankeyNode(link.source) &&
    typeof link.target === "object" &&
    isFilledSankeyNode(link.target) &&
    link.y0 !== undefined &&
    link.y1 !== undefined &&
    link.width !== undefined
  );
};

// const makeDPath = linkHorizontal()
//   .source((d) => [d.source.x1, d.y0])
//   .target((d) => [d.target.x0, d.y1]);

const getTextProps = (
  link: LinkDataPoint & FilledSankeyLinkProps,
  width: number
) => {
  const x = (link.source.x1 + link.target.x0) / 2;
  const y = (link.y1 + link.y0) / 2;

  // const textAnchor = x0 < width / 2 ? "start" : "end";
  const textAnchor = "middle";

  return {
    x,
    y,
    textAnchor,
    dy: "0.35em"
  } as const;
};

interface SankeyLinkLabelsProps {
  links: LinkDataPoint[];
  width: number;
}

export const SankeyLinkLabelsComponent = ({
  links,
  width
}: SankeyLinkLabelsProps): JSX.Element => {
  return (
    <g style={{ fontSize: 10 }}>
      {links.map((link) => {
        if (!isFilledSankeyLink(link)) return null;
        const textProps = getTextProps(link, width);

        const text = formatLinkTextFunc(link);

        const { source, target } = link;

        const key =
          (typeof source === "object" ? source.name : source) +
          "--" +
          (typeof target === "object" ? target.name : target);

        return (
          <SankeyNodeLabelComponent {...textProps} text={text} key={key} />
        );
      })}
    </g>
  );
};
