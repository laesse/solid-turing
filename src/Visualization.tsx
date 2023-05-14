import { Accessor, Show, createEffect } from 'solid-js';
import type { Instructions } from './machine-parser';
import config from './config';
import type { Edge, Options, Node } from 'vis-network/peer';
const { DataSet } = await import('vis-data/peer');
const { Network } = await import('vis-network/peer');
import 'vis-network/styles/vis-network.css';

const visualizeWithImages = (instructions: Instructions, moutPoint: HTMLElement) => {
  const instr = instructions.entries();

  const edgeDefaults = {
    arrows: 'to',
    color: {
      color: '#e2e8f0',
      highlight: '#701a75',
    },
    font: { color: '#e2e8f0', strokeWidth: 0 },
  };

  // create a network
  const container = moutPoint;
  if (container == null) throw new Error('could not mount visualizsation');

  // create an array with nodes
  const nodes = new DataSet<Node>(
    [...new Set([...instr.map(([k, v]) => k[0]), ...instr.map(([k, v]) => v[0])])].map((i) => ({
      id: i,
      // label: `q${i - 1}`,
      image: `solid-turing/q${i - 1}.png`,
      shape: 'circularImage',

      color: {
        background: 'rgba(0,0,0,0)',
        border: '#172554',
      },
    }))
  );

  // create an array with edges
  const edges: Edge[] = instr
    .map(([k, v]) => ({
      id: `${k[0]}-${v[0]}`,
      from: k[0],
      to: v[0],
      label: `${k[1] === ' ' ? '_' : k[1]}/${v[1] === ' ' ? '_' : v[1]},${
        v[2] == config.RIGHT ? 'R' : 'L'
      }`,
      ...edgeDefaults,
    }))
    .reduce((acc, current) => {
      const itemIndex = acc.findIndex((a) => a.from === current.from && a.to === current.to);
      if (itemIndex === -1) {
        acc.push(current);
      } else {
        acc[itemIndex].label += `\n${current.label}`;
      }
      return acc;
    }, [] as Edge[]);

  nodes.add({
    id: -1,
    shape: 'circle',
    color: {
      background: 'rgba(0,0,0,0)',
      border: 'rgba(0,0,0,0)',
    },
  });
  edges.push({
    id: '-1-1',
    from: -1,
    to: 1,
    label: 'start',
    length: 50,
    ...edgeDefaults,
  });

  const data = {
    nodes: nodes,
    edges: edges,
  };
  const options: Options = {
    nodes: {
      borderWidth: 3,

      shapeProperties: {
        useBorderWithImage: true,
        borderRadius: 10,
      },
      color: {
        highlight: {
          border: '#701a75',
        },
      },
    },
  };
  var network = new Network(container, data, options);
  // update the node with the new style
  return {
    selectNode: (id: number) => {
      network.unselectAll();
      network.selectNodes([id], false);
    },
    selectNodeAndEdge: (nodeId: number, edgeId: string) => {
      network.setSelection(
        {
          nodes: [nodeId],
          edges: [edgeId],
        },
        { unselectAll: true, highlightEdges: false }
      );
    },
  };
};

type Props = {
  instructions: Accessor<Instructions | undefined>;
  machineState: Accessor<{ currentState: number }>;
  currentInstruction: Accessor<string>;
};

const Visualization = (props: Props) => {
  return (
    <Show
      when={props.instructions() !== undefined}
      fallback={<div class="text-center">press parse machine in order to load the machine</div>}
    >
      <VisNetworkVisualizer {...props} />
    </Show>
  );
};

const VisNetworkVisualizer = ({ instructions, machineState, currentInstruction }: Props) => {
  let callbacks: ReturnType<typeof visualizeWithImages> | undefined = undefined;
  let moutPoint: HTMLDivElement | undefined = undefined;

  createEffect(() => {
    callbacks = visualizeWithImages(instructions()!, moutPoint!);
  });
  createEffect(() => {
    const state = machineState();
    callbacks?.selectNodeAndEdge(state.currentState, currentInstruction());
  });
  return <div ref={moutPoint} class="h-full w-full relative"></div>;
};

export default Visualization;
