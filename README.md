
# Turing Machine Emulator
This app was developed for THIN. It is a universal turing machine emulator. It is a web app that allows the user to visualize and run a turing machine.
![image](https://github.com/laesse/solid-turing/assets/40475367/9a1a17f0-d042-4513-b647-ce81745f454a)

## How to use
1. Clone the repository
2. run `pnpm install && pnpm dev`
3. Open your browser and go to [localhost:3000/solid-turing](http://localhost:3000/solid-turing)

## Running other machines

The exersice was to build a turing machine that does multiplication. 
This machine is hardcoded into the app. To change the machine, you have to change the  `machine` variable in `src/config.ts`.

### Encoding
The machine is encoded in unary format. Each tranition is separated by the marker 11.
A transition consists of the following parts separated by the marker 1: 
1. the current state (e.g. "00" for state q1)
2. the current symbol (e.g. "0000" for symbol X)
3. the next state (e.g. "000" for state q2)
4. the symbol to write (e.g. "00" for symbol 1)
5. the direction to move ("0" for left, "00" for right)

note: 
- the unary to symbols mapping is defined in `TAPE_VALUE_ENCODING` in `src/config.ts` and can be alterd to your needs.
- q0 is defined as the start state and q1 as the end state.
### input value
the default input value can also be canged in `src/config.ts`.
At runtime the input value can be changed after parsing the machine

### flaci parser
If you don't want to encode the turing machine by hand, and you have designed it in flaci, you can use the flaci parser. It is a parser for the JSON savefile flaci uses.
To use it run `deno run --allow-read parse-flaci-turing.ts --file [path_your_machine_from_flaci].json`
it will print a encoded turing machine to stdout.
