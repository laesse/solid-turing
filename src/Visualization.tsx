import { Accessor, createEffect, createSignal } from 'solid-js';
import type { Instructions } from './machine-parser';
import config from './config';
import type { Edge } from 'vis-network/standalone';
const { DataSet } = await import('vis-data/peer');
const { Network } = await import('vis-network/peer');
import 'vis-network/styles/vis-network.css';

const visualize = (instructions: Instructions) => {
  const instr = instructions.entries();

  // create an array with nodes
  const nodes = new DataSet(
    [...new Set([...instr.map(([k, v]) => k[0]), ...instr.map(([k, v]) => v[0])])].map((i) => ({
      id: i,
      label: `q${i - 1}`,
      //  image: `/q${i - 1}.svg`,
      //  shape: 'image',
    }))
  );

  // create an array with edges
  const edges: Edge[] = instr
    .map(([k, v]) => ({
      from: k[0],
      to: v[0],
      arrows: 'to',
      label: `${k[1] === ' ' ? '_' : k[1]}/${v[1] === ' ' ? '_' : v[1]},${
        v[2] == config.RIGHT ? 'R' : 'L'
      }`,
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

  // create a network
  const container = document.getElementById('vis-root');
  if (container == null) throw new Error('could not mount visualizsation');
  const data = {
    nodes: nodes,
    edges: edges,
  };
  const options = {
    nodes: {
      color: {
        highlight: {
          border: '#fc383e',
          background: '#eb5987',
        },
      },
    },
  };
  var network = new Network(container, data, options);
  console.log(network);
  // update the node with the new style
  return {
    selectNode: (id: number) => {
      network.unselectAll();
      network.selectNodes([id], false);
    },
  };
};

type Props = {
  instructions: Accessor<Instructions | undefined>;
  machineState: Accessor<{ currentState: number }>;
};

const Visualization = ({ instructions, machineState }: Props) => {
  const [updateNode, setUpdateNode] = createSignal<(id: number) => void>();
  createEffect(() => {
    const i = instructions();
    console.log(i);
    if (i) {
      const cbs = visualize(i);
      setUpdateNode(() => cbs.selectNode);
    }
  });

  createEffect(() => {
    const state = machineState();
    updateNode()?.(state.currentState);
  });
  return (
    <>
      {updateNode() ? null : (
        <div class="text-center">press parse machine in order to load the machine</div>
      )}
      <div id="vis-root" class="h-full flex items-left w-full"></div>
    </>
  );
};
export default Visualization;
