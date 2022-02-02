import { csv } from "d3-fetch";

export interface SankeyDataLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyDataNode {
  name: string;
  category: string;
}

export interface SankeyData {
  nodes: SankeyDataNode[];
  links: SankeyDataLink[];
}

type RawLink = Partial<Record<keyof SankeyDataLink, string>>;

const isFullLink = (rawLink: RawLink): rawLink is Required<RawLink> => {
  return !!(rawLink.source && rawLink.target && rawLink.value);
};

export const getData = async (): Promise<SankeyData> => {
  const rawLinks: RawLink[] = await csv<"source" | "target" | "value">(
    "https://static.observableusercontent.com/files/d6774e9422bd72369f195a30d3a6b33ff9d41676cff4d89c93511e1a458efb3cfd16cbb7ce3fecdd8dd2466121e10c9bfe57fd73c7520bf358d352a92b898614?response-content-disposition=attachment%3Bfilename*%3DUTF-8%27%27energy.csv"
  );

  const links: SankeyDataLink[] = rawLinks.filter(isFullLink).map((link) => ({
    ...link,
    value: +link.value
  }));

  // d3-sankey mutates links & nodes
  console.log("links", JSON.parse(JSON.stringify(links)));

  function* picker(): Generator<string> {
    for (const { source, target } of links) {
      if (source) yield source;
      if (target) yield target;
    }
  }

  const uniqueNodeNames = new Set<string>(picker());

  const nodes = Array.from(uniqueNodeNames, (name) => ({
    name,
    category: name.replace(/\s.*/, "")
  }));
  console.log("nodes", JSON.parse(JSON.stringify(nodes)));

  return { nodes, links };
};
