import sampleData from "./giantRoute_1.json";
// import sampleData from "./multiRoute_1.json";
// import sampleData from "./bestRoute_1.json";
import { OptimalRatesWithPartnerFees, OptimalRate } from "paraswap";

interface ExchangeData {
  router?: string; // address
  path?: string[]; // address[]
  tokenFrom: string; // address
  tokenTo: string; // address
  gasUSD: string; // float
  [key: string]: any; // and anything else
}

interface ExchangeNode extends OptimalRate {
  data?: ExchangeData;
}
interface ExchangeNodeWithData extends OptimalRate {
  data: ExchangeData;
}

interface OptimalRoute {
  percent: string;
  route: ExchangeNode[][];
}

type PriceRouteInterface = Omit<OptimalRatesWithPartnerFees, "side"> & {
  giantPath?: boolean;
  giantRoute?: OptimalRoute[];
  multiRoute?: ExchangeNode[][];
  bestRoute: ExchangeNode[];
  side: string;
};

interface PriceError {
  error?: string;
  value?: string;
}

export interface PriceRouteData extends PriceError {
  priceRoute: PriceRouteInterface;
}

interface SampleData {
  error?: string;
  value?: string;
}

export interface SankeyDataNode {
  name: string;
  tokenData: {
    address: string;
  };
}

interface SankeyDataLinkBase {
  source: string;
  target: string;
  value: number;
}

export enum SankeyDataLinkType {
  ROOT = "root",
  EXCHANGE = "exchange"
}

export interface SankeyDataLinkRoot extends SankeyDataLinkBase {
  type: SankeyDataLinkType.ROOT;
}

export interface SankeyDataLinkExchange extends SankeyDataLinkBase {
  type: SankeyDataLinkType.EXCHANGE;
  exchangeData: ExchangeNode[];
}

export type SankeyDataLink = SankeyDataLinkRoot | SankeyDataLinkExchange;

export interface SankeyData {
  nodes: SankeyDataNode[];
  links: SankeyDataLink[];
}

export function makeSankeyData(data: PriceRouteData): SankeyData | null {
  const { details, bestRoute, multiRoute, giantRoute } = data.priceRoute;

  // if we don't have details, opt-out
  if (!details) return null;

  const { tokenFrom, tokenTo } = details;

  // compile Source and Destination nodes
  const SourceNode: SankeyDataNode = {
    name: tokenFrom + "-IN",
    tokenData: {
      address: tokenFrom
    }
  };
  const DestinationNode: SankeyDataNode = {
    name: tokenTo + "-OUT",
    tokenData: {
      address: tokenTo
    }
  };

  // compile nodes and links between Source and Destination

  // for now assume we have giantRoute
  if (giantRoute && giantRoute.length > 0) {
    return processGiantRoute({
      sourceNode: SourceNode,
      destinationNode: DestinationNode,
      giantRoute
    });
  }

  if (multiRoute && multiRoute.length > 0) {
    return processMultiRoute({
      sourceNode: SourceNode,
      destinationNode: DestinationNode,
      multiRoute
    });
  }

  return processBestRoute({
    sourceNode: SourceNode,
    destinationNode: DestinationNode,
    bestRoute
  });
}

makeSankeyData(sampleData); // ?

interface ProcessGiantRouteInput {
  sourceNode: SankeyDataNode;
  destinationNode: SankeyDataNode;
  giantRoute: OptimalRoute[];
}

function processGiantRoute({
  sourceNode,
  destinationNode,
  giantRoute
}: ProcessGiantRouteInput): SankeyData {
  let nodes: SankeyDataNode[] = [];
  let links: SankeyDataLink[] = [];

  // compile for the whole priceRoute.giantRoute
  giantRoute.forEach(({ percent, route }, routeIndex) => {
    // we don't have any more branching, so branchValue is const
    const branchValue = +percent;

    const {
      nodes: branchNodes,
      links: branchLinks
    } = processGroupOfExchangeGroups({
      sourceNode,
      destinationNode,
      route,
      routeIndex,
      branchValue
    });

    nodes = nodes.concat(branchNodes);
    links = links.concat(branchLinks);
  });

  const finalNodes = [sourceNode, ...nodes, destinationNode];

  return {
    nodes: finalNodes,
    links
  };
}

interface ProcessMultiRouteInput {
  sourceNode: SankeyDataNode;
  destinationNode: SankeyDataNode;
  multiRoute: ExchangeNode[][];
}

function processMultiRoute({
  sourceNode,
  destinationNode,
  multiRoute
}: ProcessMultiRouteInput): SankeyData {
  const { nodes, links } = processGroupOfExchangeGroups({
    sourceNode,
    destinationNode,
    route: multiRoute,
    routeIndex: 0, // only index
    branchValue: 100 // full Token flow
  });

  const finalNodes = [sourceNode, ...nodes, destinationNode];

  return {
    nodes: finalNodes,
    links
  };
}

interface ProcessBestRouteInput {
  sourceNode: SankeyDataNode;
  destinationNode: SankeyDataNode;
  bestRoute: ExchangeNode[];
}

function processBestRoute({
  sourceNode,
  destinationNode,
  bestRoute
}: ProcessBestRouteInput): SankeyData {
  return processMultiRoute({
    sourceNode,
    destinationNode,
    multiRoute: [bestRoute]
  });
}

interface ProcessGroupOfExchangeGroupsInput {
  sourceNode: SankeyDataNode;
  destinationNode: SankeyDataNode;
  route: ExchangeNode[][];
  routeIndex: number;
  branchValue: number;
}

function processGroupOfExchangeGroups({
  sourceNode,
  destinationNode,
  route,
  routeIndex,
  branchValue
}: ProcessGroupOfExchangeGroupsInput): SankeyData {
  const nodes: SankeyDataNode[] = [];
  const links: SankeyDataLink[] = [];

  // to generate a unique name when there are multiple branches
  const nameSuffix = `-${routeIndex}`;

  // node to represent first (same as Source IN) Token but inside the chart
  const firstNode: SankeyDataNode = {
    name: sourceNode.name + nameSuffix,
    tokenData: sourceNode.tokenData
  };

  // link from Source IN to first node
  const firstLink: SankeyDataLinkRoot = {
    source: sourceNode.name,
    target: firstNode.name,
    value: branchValue,
    type: SankeyDataLinkType.ROOT
  };

  links.push(firstLink);

  // node to represent last (same as Destination OUT) Token but inside the chart
  const lastNode: SankeyDataNode = {
    name: destinationNode.name + nameSuffix,
    tokenData: destinationNode.tokenData
  };

  // link from Destination OUT to last node
  const lastLink: SankeyDataLinkRoot = {
    source: lastNode.name,
    target: destinationNode.name,
    value: branchValue,
    type: SankeyDataLinkType.ROOT
  };

  // no intermediate links, exchanges, nodes
  // shouldn't happen with giantRoute or multiRoute
  if (route.length === 0) {
    // @TODO consider different type for one-path (not multi-path) direct exchange
    // we still have an exchange anyway
    // connect first node to last node directly
    const singleLink: SankeyDataLinkRoot = {
      source: firstNode.name,
      target: lastNode.name,
      type: SankeyDataLinkType.ROOT,
      value: branchValue // the whole Token amount in this branch
    };

    // connect the branch through nodes and links
    nodes.push(firstNode, lastNode);
    links.push(singleLink, lastLink);
    return { nodes, links };
  }

  // inputNode same as firstNode at first
  // then same as outputNode in exchanges
  let inputNode = firstNode;

  // compile for each ExchangeNode[] inside priceRoute.giantRoute.route: ExchangeNode[][]
  route.forEach((exchanges, exchangesIndex) => {
    const { node, link, nextNode } = processExchangesArray({
      exchanges,
      currentExchangesIndex: exchangesIndex,
      lastExhangesIndex: route.length - 1,
      firstNode,
      lastNode,
      branchValue,
      inputNode
    });

    if (node) nodes.push(node);
    links.push(link);

    // now next input node becomes current output node
    if (nextNode) inputNode = nextNode;
  });

  // final linking
  nodes.push(lastNode);
  links.push(lastLink);

  return { nodes, links };
}

interface ProcessExchangesArrayInput {
  exchanges: ExchangeNode[];
  currentExchangesIndex: number;
  lastExhangesIndex: number;
  firstNode: SankeyDataNode;
  lastNode: SankeyDataNode;
  branchValue: number;
  inputNode: SankeyDataNode;
}

interface ProcessExchangesArrayResult {
  node?: SankeyDataNode;
  link: SankeyDataLink;
  nextNode?: SankeyDataNode;
}

function processExchangesArray({
  exchanges,
  currentExchangesIndex,
  lastExhangesIndex,
  firstNode,
  lastNode,
  branchValue,
  inputNode
}: ProcessExchangesArrayInput): ProcessExchangesArrayResult {
  // if empty exchanges group, which shouldn't happen
  if (exchanges.length === 0) {
    // a link that just connects first to last node
    const passThroughLink: SankeyDataLinkExchange = {
      source: firstNode.name,
      target: lastNode.name,
      value: branchValue, // the whole flow of the branch
      type: SankeyDataLinkType.EXCHANGE,
      exchangeData: exchanges
    };

    return { link: passThroughLink };
  }

  const exchangeWithTokenInData = exchanges.find<ExchangeNodeWithData>(
    (exchange): exchange is ExchangeNodeWithData => !!exchange.data?.tokenTo
  );

  if (!exchangeWithTokenInData)
    throw new Error(
      `Exchanges at index ${currentExchangesIndex} don't contain data with tokens`
    );

  const { tokenTo } = exchangeWithTokenInData.data;

  let outputNode: SankeyDataNode;

  // very last exchanges group
  if (currentExchangesIndex === lastExhangesIndex) {
    // outputNode same as lastNode
    outputNode = lastNode;
  } else {
    // compile output node
    outputNode = {
      name: `${tokenTo}-${currentExchangesIndex}`,
      tokenData: {
        address: tokenTo
      }
    };
  }

  // link input node with output node for exchanges
  const link: SankeyDataLinkExchange = {
    source: inputNode.name,
    target: outputNode.name,
    value: branchValue, // the whole flow of the branch
    type: SankeyDataLinkType.EXCHANGE,
    exchangeData: exchanges
  };

  return { node: inputNode, link, nextNode: outputNode };
}

export const run = () => makeSankeyData(sampleData);
