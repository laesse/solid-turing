import { Accessor, Setter, batch } from 'solid-js';
import { BingoBöp, MachineState } from './App';
import config from './config';
import { Instructions } from './machine-parser';

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
  getSpeed: Accessor<number>,
  setCurrentInstruction: Setter<string>
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
    const { currentState, tape, readWriteHead } = machineState();

    const newTape =
      tape.substring(0, readWriteHead) +
      writeValue +
      tape.substring(machineState().readWriteHead + 1, tape.length);

    const newReadWriteHead = readWriteHead + (direction == config.LEFT ? 1 : -1);

    batch(() => {
      setCurrentInstruction(`${currentState}-${nextState}`);
      setMachineState({ currentState: nextState, tape: newTape, readWriteHead: newReadWriteHead });
      inc();
    });
    await sleep(getSpeed());
  }
};

export const turing = async (
  machineState: Accessor<MachineState>,
  setMachineState: Setter<MachineState>,
  setBingoBöp: Setter<BingoBöp>,
  instructions: Instructions,
  getSpeed: Accessor<number>,
  run: boolean,
  setStepCount: Setter<number>,
  setCurrentInstruction: Setter<string>
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
      getSpeed,
      setCurrentInstruction
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
