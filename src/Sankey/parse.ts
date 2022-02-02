import {
  sankey,
  SankeyLayout,
  sankeyLeft,
  sankeyRight,
  sankeyCenter,
  sankeyJustify
} from "d3-sankey";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { format } from "d3-format";

// import { SankeyData, SankeyDataLink, SankeyDataNode } from "./data";
import { NodeDataPoint } from "./SankeyNodes";
import { LinkDataPoint } from "./SankeyLinks";

import {
  SankeyData,
  SankeyDataLink,
  SankeyDataLinkType,
  SankeyDataNode
} from "./massageData";

const d3Color = scaleOrdinal(schemeCategory10);

export const colorRectFunc = (dataPoint: NodeDataPoint) =>
  d3Color(dataPoint.tokenData.address);

export const colorLinkFunc = (dataPoint: LinkDataPoint) => {
  const name =
    typeof dataPoint.target === "object"
      ? dataPoint.target.name
      : dataPoint.target;

  return d3Color(name);
};

const d3format = format(",.0f");

export const formatNodeTitleFunc = (dataPoint: NodeDataPoint) => {
  return dataPoint.tokenData.address;
};

const roundPercent = (n: number) => n.toPrecision(3).replace(/\.0+/, "");

export const formatLinkTitleFunc = (dataPoint: LinkDataPoint): string => {
  if (dataPoint.type === SankeyDataLinkType.ROOT) {
    return dataPoint.value + "%";
  }

  const { exchangeData } = dataPoint;

  if (exchangeData.length === 0) return "";

  if (exchangeData.length === 1) return exchangeData[0].exchange + " 100%";

  return exchangeData
    .map(({ exchange, percent }) => `${exchange} ${roundPercent(+percent)}%`)
    .join(", ");
};

export const formatLinkTextFunc = (dataPoint: LinkDataPoint): string => {
  if (dataPoint.type === SankeyDataLinkType.ROOT) {
    return dataPoint.value + "%";
  }

  const { exchangeData } = dataPoint;

  if (exchangeData.length === 0) return "";

  if (exchangeData.length === 1) return exchangeData[0].exchange;

  return "Multiple DEXs";
};

interface MakeSankeyInput {
  width: number;
  height: number;
}

export const makeSankeyFunc = ({
  width,
  height
}: MakeSankeyInput): SankeyLayout<
  SankeyData,
  SankeyDataNode,
  SankeyDataLink
> => {
  const sankeyGen = sankey<SankeyDataNode, SankeyDataLink>()
    .nodeId((d) => d.name)
    .nodeWidth(30)
    .nodePadding(100)
    .nodeAlign(sankeyCenter)
    // .nodes((g) => {
    //   // console.log("In gen nodes:slice", JSON.parse(JSON.stringify(g.nodes[0])));
    //   g.nodes[0].y0 = 0;
    //   g.nodes[0].y1 = 0;
    //   console.log("In gen nodes", g.nodes[0].y0);
    //   return g.nodes;
    // })
    // @TODO add types
    // thicker branch on top
    .linkSort((l1: SankeyDataLink, l2: SankeyDataLink) => l2.value - l1.value)
    .extent([
      [1, 5],
      [width - 1, height - 5]
    ]);

  return sankeyGen;
};

const lowercaseAddress2SymbolMap: Record<string, string | undefined> = {
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": "AAVE",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "ETH",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC"
};

export const formatTokenText = (dataPoint: NodeDataPoint): string => {
  return (
    lowercaseAddress2SymbolMap[dataPoint.tokenData.address.toLowerCase()] || "?"
  );
};
