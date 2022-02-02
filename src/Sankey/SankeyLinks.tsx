import React from "react";

import { SankeyLink as SankeyLinkType, sankeyLinkHorizontal } from "d3-sankey";
// import { SankeyDataLink, SankeyDataNode } from "./data";
// import { linkHorizontal } from "d3-shape";

import { SankeyDataLink, SankeyDataNode } from "./massageData";

export type LinkDataPoint = SankeyLinkType<SankeyDataNode, SankeyDataLink>;

const makeDPath = sankeyLinkHorizontal<SankeyDataNode, SankeyDataLink>();
// same as
// const makeDPath = linkHorizontal()
//   .source((d) => [d.source.x1, d.y0])
//   .target((d) => [d.target.x0, d.y1]);

interface SankeyLinkComponentProps {
  d: string;
  strokeWidth?: number;
  color?: string;
  title?: string;
}

export const SankeyLinkComponent = ({
  d,
  color,
  strokeWidth,
  title
}: SankeyLinkComponentProps): JSX.Element => {
  return (
    <g style={{ mixBlendMode: "multiply" }}>
      <path d={d} stroke={color} strokeWidth={strokeWidth}>
        {title && <title>{title}</title>}
      </path>
    </g>
  );
};

interface SankeyLinksComponentProps {
  links: LinkDataPoint[];
  titleFunc?(link: LinkDataPoint): string;
  colorFunc?(link: LinkDataPoint): string;
}

export const SankeyLinksComponent = ({
  links,
  titleFunc,
  colorFunc
}: SankeyLinksComponentProps): JSX.Element => {
  return (
    <g fill="none" strokeOpacity={0.5}>
      {links.map((link) => {
        const d = makeDPath(link);

        if (!d) return null;

        const strokeWidth = Math.max(1, link.width || 0);

        const { source, target } = link;
        const key =
          (typeof source === "object" ? source.name : source) +
          "--" +
          (typeof target === "object" ? target.name : target);

        return (
          <SankeyLinkComponent
            key={key}
            d={d}
            color={colorFunc?.(link)}
            title={titleFunc?.(link)}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </g>
  );
};
