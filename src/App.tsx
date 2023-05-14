import { Accessor, Component, For, Setter, Show, createSignal, lazy } from 'solid-js';
import className from 'classnames';
const Visualization = lazy(() => import('./Visualization'));
import config from './config';
import { Instructions, parseProgramm } from './machine-parser';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const turingRun = (
  machineState: MachineState,
  instructions: Instructions
): [MachineState, number] => {
  let currentInstr;
  let i = 0;
  console.log('running machine in run mode');
  while (
    (currentInstr = instructions.get([
      machineState.currentState,
      (machineState.tape.at(
        machineState.readWriteHead
      ) as (typeof config.TAPE_VALUE_ENCODING)[number]) || ' ',
    ])) !== undefined
  ) {
    const [nextState, writeValue, direction] = currentInstr;
    const { tape, readWriteHead } = machineState;

    const newTape =
      tape.substring(0, readWriteHead) +
      writeValue +
      tape.substring(machineState.readWriteHead + 1, tape.length);

    const newReadWriteHead = readWriteHead + (direction == config.LEFT ? 1 : -1);

    machineState.currentState = nextState;
    machineState.tape = newTape;
    machineState.readWriteHead = newReadWriteHead;
    i++;
  }
  return [machineState, i];
};

const runMachineStepMode = async (
  instructions: Instructions,
  machineState: Accessor<MachineState>,
  setMachineState: Setter<MachineState>,
  inc: () => void,
  getSpeed: Accessor<number>
) => {
  let currentInstr;
  while (
    (currentInstr = instructions.get([
      machineState().currentState,
      (machineState().tape.at(
        machineState().readWriteHead
      ) as (typeof config.TAPE_VALUE_ENCODING)[number]) || ' ',
    ])) !== undefined
  ) {
    const [nextState, writeValue, direction] = currentInstr;
    const { tape, readWriteHead } = machineState();

    const newTape =
      tape.substring(0, readWriteHead) +
      writeValue +
      tape.substring(machineState().readWriteHead + 1, tape.length);

    const newReadWriteHead = readWriteHead + (direction == config.LEFT ? 1 : -1);

    setMachineState({ currentState: nextState, tape: newTape, readWriteHead: newReadWriteHead });
    inc();
    await sleep(getSpeed());
  }
};

const turing = async (
  machineState: Accessor<MachineState>,
  setMachineState: Setter<MachineState>,
  setBingoBöp: Setter<BingoBöp>,
  instructions: Instructions,
  getSpeed: Accessor<number>,
  run: boolean,
  setStepCount: Setter<number>
) => {
  if (run) {
    let [newState, i] = turingRun(machineState(), instructions);
    console.log('finished running machine', newState);
    setMachineState({ ...newState });
    setStepCount(i);
  } else {
    await runMachineStepMode(
      instructions,
      machineState,
      setMachineState,
      () => setStepCount((i) => i + 1),
      getSpeed
    );
  }

  if (machineState().currentState == 2) {
    setBingoBöp({
      success: 'bingo',
      resultOfCalculation: config.multiplicationMachine
        ? machineState().tape.substring(machineState().readWriteHead).length
        : undefined,
    });
  } else {
    setBingoBöp({ success: 'böp' });
  }
};

export type MachineState = { currentState: number; tape: string; readWriteHead: number };

export type BingoBöp = { success: 'bingo' | 'böp'; resultOfCalculation?: number };

const App: Component = () => {
  const [machineState, setMachineState] = createSignal<MachineState>({
    currentState: 1,
    tape: config.machine + '00100',
    readWriteHead: 0,
  });
  const [bingoBöp, setBingoBöp] = createSignal<BingoBöp>();
  const [steps, setSteps] = createSignal(0);
  const [speed, setSpeed] = createSignal(500);

  const [instructions, setInstructions] = createSignal<Instructions>();

  const [runMode, setRunMode] = createSignal<boolean>(false);
  const [machineRunning, setMachineRunning] = createSignal<boolean>(false);

  const slicedTape = () => {
    const slicedTape = ('_'.repeat(15) + machineState().tape + '_'.repeat(15)).slice(
      machineState().readWriteHead,
      machineState().readWriteHead +
        30 +
        (machineState().tape.length > machineState().readWriteHead ? 0 : 1)
    );
    return slicedTape;
  };
  const startTuring = () => {
    const instr = instructions();
    if (!instr) throw new Error('no instructions');

    setMachineRunning(true);
    turing(machineState, setMachineState, setBingoBöp, instr, speed, runMode(), setSteps).then(() =>
      setMachineRunning(false)
    );
  };

  const machineDone = () => {
    return bingoBöp()?.success !== undefined;
  };

  const parseMachine = () => {
    setInstructions(parseProgramm(machineState().tape.split('111')[0]));

    let readWriteHead = 15;

    const newTape =
      ' '.repeat(15) + machineState().tape.slice(machineState().tape.indexOf('111') + 3);
    setMachineState({ currentState: 1, tape: newTape, readWriteHead });
  };
  const onSpeedChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSpeed(Math.abs(parseInt(target.value) - 10) * 100);
  };
  return (
    <div
      class={className('h-[100vh] p-4 flex flex-col items-center', {
        'bg-gradient-to-r from-green-400 to-emerald-500 ': bingoBöp()?.success === 'bingo',
        'bg-red-500': bingoBöp()?.success === 'böp',
        'bg-gradient-to-r from-teal-400 to-yellow-200': bingoBöp() === undefined,
      })}
    >
      <h1 class="text-3xl font-bold">Turing emulator</h1>

      <div class="w-3/4 flex-grow flex-shrink">
        <Visualization instructions={instructions} machineState={machineState} />
      </div>

      <div class="flex flex-col items-center justify-center w-2/3 p-4 rounded-md shadow-md bg-slate-300 bg-opacity-50 ">
        <div class="grid grid-cols-2 gap-x-4 mb-4">
          <span class="font-bold">currentState:</span>
          <span>q{machineState().currentState - 1}</span>
          <span class="font-bold">read write head:</span>
          <span> {machineState().readWriteHead}</span>
          <span class="font-bold">step count:</span>
          <span> {steps()}</span>
        </div>

        <Tape tape={slicedTape} />
        <div class="">
          <MachineControl
            instructions={instructions}
            machineRunning={machineRunning}
            startTuring={startTuring}
            parseMachine={parseMachine}
            onSpeedChange={onSpeedChange}
            runMode={runMode}
            setRunMode={setRunMode}
            machineDone={machineDone}
            machineState={machineState}
            setTape={(tape) => setMachineState((s) => ({ ...s, tape }))}
          />
        </div>
        <Show when={bingoBöp()?.resultOfCalculation !== undefined && config.multiplicationMachine}>
          <span class="text-xl font-bold">
            the calculation result is: {bingoBöp()?.resultOfCalculation}
          </span>
        </Show>
      </div>
    </div>
  );
};

type MachineControlProps = {
  instructions: Accessor<Instructions | undefined>;
  machineRunning: Accessor<boolean>;
  startTuring: () => void;
  parseMachine: () => void;
  onSpeedChange: (e: Event) => void;
  runMode: Accessor<boolean>;
  setRunMode: Setter<boolean>;
  machineDone: () => boolean;
  machineState: Accessor<MachineState>;
  setTape: (tape: string) => void;
};

const MachineControl = ({
  instructions,
  machineRunning,
  startTuring,
  parseMachine,
  onSpeedChange,
  runMode,
  setRunMode,
  machineDone,
  machineState,
  setTape,
}: MachineControlProps) => {
  return (
    <div class="flex flex-col gap-2 mt-3">
      <Show when={instructions() === undefined && !machineDone()}>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={parseMachine}
        >
          parse machine
        </button>
      </Show>
      <Show when={instructions() !== undefined && !machineRunning() && !machineDone()}>
        <label>
          initial tape
          <input
            type="text"
            class="ml-3"
            value={machineState().tape}
            onInput={(e) => setTape(e.currentTarget.value)}
          />
        </label>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={startTuring}
        >
          Start machine
        </button>
        <label>
          Run mode
          <input
            type="checkbox"
            class="m-3"
            value={runMode() ? 'true' : 'false'}
            onChange={() => setRunMode((r) => !r)}
          />
        </label>
      </Show>
      <Show when={machineRunning() && instructions() !== undefined}>
        {runMode() === false ? (
          <>
            <label class="mr-2">
              Change speed
              <input
                type="range"
                onInput={onSpeedChange}
                min="0"
                max="10"
                value="5"
                class="slider ml-6"
              />
            </label>
          </>
        ) : (
          <div class="text-xl">running machine in run mode 🚀</div>
        )}
      </Show>
    </div>
  );
};

const Tape = ({ tape: tapeStr }: { tape: Accessor<string> }) => {
  return (
    <div class="flex">
      <For each={tapeStr().split('').slice(0, 15)}>
        {(item) => (
          <div class="bg-green-300 h-10 w-10 border-y-black border-l-black border-r-0 border flex place-items-center justify-center">
            {item == ' ' ? '_' : item}
          </div>
        )}
      </For>
      <div class="bg-blue-400 h-10 w-10 border-black border text-center  flex place-items-center justify-center">
        {tapeStr().split('')[15] === ' ' ? '_' : tapeStr().split('')[15]}
      </div>
      <For each={tapeStr().split('').slice(16)}>
        {(item) => (
          <div class="bg-green-300 h-10 w-10 border-r-black border-l-0 border-y-black border text-center  flex place-items-center justify-center">
            {item == ' ' ? '_' : item}
          </div>
        )}
      </For>
    </div>
  );
};

export default App;
