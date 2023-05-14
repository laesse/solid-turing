import { Accessor, Component, For, Setter, Show, createSignal, lazy } from 'solid-js';

const Visualization = lazy(() => import('./Visualization'));
import config from './config';
import { Instructions, parseProgramm } from './machine-parser';
import { turing } from './turing';

export type MachineState = { currentState: number; tape: string; readWriteHead: number };

export type BingoBöp = { success: 'bingo' | 'böp'; resultOfCalculation?: number };

const App: Component = () => {
  const [machineState, setMachineState] = createSignal<MachineState>({
    currentState: 1,
    tape: config.machine + '111' + config.initialTapeValue,
    readWriteHead: 0,
  });
  const [bingoBöp, setBingoBöp] = createSignal<BingoBöp>();
  const [steps, setSteps] = createSignal(0);
  const [speed, setSpeed] = createSignal(500);

  const [instructions, setInstructions] = createSignal<Instructions>();

  const [runMode, setRunMode] = createSignal<boolean>(false);
  const [machineRunning, setMachineRunning] = createSignal<boolean>(false);
  const [currentInstruction, setCurrentInstruction] = createSignal<string>('-1-1');

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
    turing(
      machineState,
      setMachineState,
      setBingoBöp,
      instr,
      speed,
      runMode(),
      setSteps,
      setCurrentInstruction
    ).then(() => setMachineRunning(false));
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
    <div class="h-screen flex flex-col items-center text-slate-50 overflow-hidden bg-slate-900">
      <div class="flex flex-col items-center w-2/3 h-full shadow-md bg-slate-600 ">
        <h1 class="text-4xl font-bold m-2">Turing emulator</h1>

        <div class="w-full flex-grow flex-shrink">
          <Visualization
            instructions={instructions}
            machineState={machineState}
            currentInstruction={currentInstruction}
          />
        </div>

        <div class="flex flex-col items-center justify-center w-full p-4 rounded-md bg-slate-800 shadow-md ">
          <div class="grid grid-cols-2 gap-x-4 mb-4">
            <span class="font-bold">currentState:</span>
            <span>q{machineState().currentState - 1}</span>
            <span class="font-bold">read write head:</span>
            <span> {machineState().readWriteHead}</span>
            <span class="font-bold">step count:</span>
            <span> {steps()}</span>
          </div>

          <Tape tape={slicedTape} />
          <div>
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
              bingoBöp={bingoBöp}
            />
          </div>
        </div>
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
  bingoBöp: Accessor<BingoBöp | undefined>;
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
  bingoBöp,
}: MachineControlProps) => {
  return (
    <div class="flex flex-col gap-1 mt-3 h-20 justify-center">
      <Show when={instructions() === undefined && !machineDone()}>
        <button
          class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
          onClick={parseMachine}
        >
          parse machine
        </button>
      </Show>
      <Show when={instructions() !== undefined && !machineRunning() && !machineDone()}>
        <div class="mb-2">
          <label>
            initial tape
            <input
              type="text"
              class="ml-3 text-black"
              value={machineState().tape}
              onInput={(e) => setTape(e.currentTarget.value)}
            />
          </label>
          <label class="m-3">
            Run mode
            <input
              type="checkbox"
              class="ml-3"
              value={runMode() ? 'true' : 'false'}
              onChange={() => setRunMode((r) => !r)}
            />
          </label>
        </div>

        <button
          class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
          onClick={startTuring}
        >
          Start machine
        </button>
      </Show>
      <Show when={machineRunning() && instructions() !== undefined}>
        {runMode() === false ? (
          <>
            <label class="mr-2 flex justify-center">
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
      <Show when={bingoBöp()?.success === 'bingo'}>
        <div class="bg-emerald-800 h-full  flex flex-col items-center justify-center px-20 rounded-md shadow-sm ">
          <span class="text-xl">Bingo! 🎉</span>
          <Show
            when={bingoBöp()?.resultOfCalculation !== undefined && config.multiplicationMachine}
          >
            <span class="text-xl">
              calculation result:
              <span class="text-xl ml-2 font-bold">{bingoBöp()?.resultOfCalculation}</span>
            </span>
          </Show>
        </div>
      </Show>
      <Show when={bingoBöp()?.success === 'böp'}>
        <div class="bg-red-800 h-full  flex flex-col items-center justify-center px-20 rounded-md shadow-sm ">
          <span class="text-xl">böp! </span>
        </div>
      </Show>
    </div>
  );
};

const Tape = ({ tape: tapeStr }: { tape: Accessor<string> }) => {
  return (
    <div class="flex">
      <For each={tapeStr().split('').slice(0, 15)}>
        {(item) => (
          <div class="bg-sky-900 h-12 w-10 border-y-black border-l-black border-r-0 border flex place-items-center justify-center">
            {item == ' ' ? '_' : item}
          </div>
        )}
      </For>
      <div class="bg-fuchsia-900 h-12 w-10 border-black border text-center  flex place-items-center justify-center">
        {tapeStr().split('')[15] === ' ' ? '_' : tapeStr().split('')[15]}
      </div>
      <For each={tapeStr().split('').slice(16)}>
        {(item) => (
          <div class="bg-sky-900 h-12 w-10 border-r-black border-l-0 border-y-black border text-center  flex place-items-center justify-center">
            {item == ' ' ? '_' : item}
          </div>
        )}
      </For>
    </div>
  );
};

export default App;
