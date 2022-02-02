import React, { useEffect, useMemo, useState } from "react";
import { useMeasure } from "react-use";

// import { getData, SankeyData } from "./data";
import { SankeyNodesComponent } from "./SankeyNodes";
import { SankeyLinksComponent } from "./SankeyLinks";
import { SankeyNodeLabelsComponent } from "./SankeyNodeLabels";
import { SankeyLinkLabelsComponent } from "./SankeyLinkLabels";
import {
  colorLinkFunc,
  colorRectFunc,
  formatLinkTitleFunc,
  formatNodeTitleFunc,
  formatTokenText,
  makeSankeyFunc
} from "./parse";

import { makeSankeyData, run, SankeyData } from "./massageData";

interface SankeyChartProps {
  width: number;
  height: number;
}

export const SankeyChart = ({
  width,
  height
}: SankeyChartProps): JSX.Element | null => {
  const [data, setData] = useState<SankeyData | null>(null);

  useEffect(() => {
    // getData().then(setData);
    setData(run());
  }, []);

  const sankeyGen = useMemo(
    () =>
      makeSankeyFunc({
        width,
        height
      }),
    [width, height]
  );

  const sankeyResult = useMemo(() => {
    if (!data) return null;
    data.nodes[0].y0 = 0;

    const genned = sankeyGen(data);
    const { 0: firstNode, [genned.nodes.length - 1]: lastNode } = genned.nodes;
    const height = firstNode.y1 - firstNode.y0;
    console.log("height", height);
    firstNode.y0 = 5;
    firstNode.y1 = height;
    lastNode.y0 = 5;
    lastNode.y1 = height;

    return sankeyGen.update(genned);

    return genned;
  }, [data, sankeyGen]);

  if (!data || !sankeyResult) return null;

  const { nodes, links } = sankeyResult;

  console.log("sankey links", links);
  console.log("sankey nodes", nodes);

  return (
    <svg width={width} height={height}>
      <SankeyNodesComponent
        nodes={nodes}
        colorFunc={colorRectFunc}
        titleFunc={formatNodeTitleFunc}
      />
      <SankeyLinksComponent
        links={links}
        colorFunc={colorLinkFunc}
        titleFunc={formatLinkTitleFunc}
      />
      <SankeyNodeLabelsComponent
        nodes={nodes}
        width={width}
        textFunc={formatTokenText}
      />
      <SankeyLinkLabelsComponent links={links} width={width} />
    </svg>
  );
};

export const Sankey = (): JSX.Element => {
  const [ref, measurements] = useMeasure<HTMLDivElement>();
  const { width } = measurements;

  return (
    // ResizeObserver doesn't work directly on <svg/>
    <div ref={ref}>
      {width > 0 && <SankeyChart width={width} height={600} />}
    </div>
  );
};
