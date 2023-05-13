import { readFile } from 'node:fs/promises';
import { parse } from 'https://deno.land/std@0.184.0/flags/mod.ts';
type MultiTuring = typeof import('./Automaton_multi-turing.json');
import 'npm:@total-typescript/ts-reset';

const flags = parse(Deno.args, {
  string: ['file'],
  default: { file: './Automaton_multi-turing.json' },
});

const multiTuring = JSON.parse((await readFile(flags.file)).toString()) as MultiTuring;

type State = {
  transition?: { Source: number; Target: number; x: number; y: number; Labels: string[][] };
  start: boolean;
  final: boolean;
  id: number;
};

const states: State[] = multiTuring.automaton.States.flatMap((state) =>
  state.Transitions.length === 0
    ? { start: state.Start, final: state.Final, id: state.ID }
    : state.Transitions.map((t) => ({
        transition: t,
        start: state.Start,
        final: state.Final,
        id: state.ID,
      }))
);

const TAPE_VALUE_ENCODING = ['0', '1', '_', 'X', 'Y'] as const;

const endId = states.find((state) => state.final)?.id;
if (!endId) throw new Error('No end state found');
const swapWithEndId = (id: number) => (id === endId ? 2 : id === 2 ? endId : id);
console.log(
  states
    .flatMap((t) =>
      t.transition?.Labels.map((l) => ({
        readValue: l[0],
        writeValue: l[1],
        direction: l[2],
        src: swapWithEndId(t.transition?.Source as number),
        dest: swapWithEndId(t.transition?.Target as number),
      }))
    )
    .filter(Boolean)
    .map(
      (a) =>
        `${'0'.repeat(a.src)}1${'0'.repeat(
          TAPE_VALUE_ENCODING.indexOf(a.readValue) + 1
        )}1${'0'.repeat(a.dest)}1${'0'.repeat(
          TAPE_VALUE_ENCODING.indexOf(a.writeValue) + 1
        )}1${'0'.repeat(a.direction === 'L' ? 2 : 1)}`
    )
    .join('11')
);

states.map((t) => ({ id: t.id, fin: t.final, start: t.start }));

export {};
