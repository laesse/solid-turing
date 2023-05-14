
# Turing Machine Emulator
Designed for my theoretical Computer Science class, this web app serves as a universal Turing machine emulator. It allows users to visualize and run Turing machines.
![image](https://github.com/laesse/solid-turing/assets/40475367/9a1a17f0-d042-4513-b647-ce81745f454a)

## How to use
1. Clone the repository
2. run `pnpm install && pnpm dev`
3. Open your browser and go to [localhost:3000/solid-turing](http://localhost:3000/solid-turing)

If you just want to use the multiplication machine you can do this [here](https://laesse.github.io/solid-turing/)

## Running other machines
The multiplication machine is directly programmed into the application. If you want to run your own machine, simply modify the `machine` variable in the `src/config.ts` file. In the same file you can also change default tape value.

### Encoding your machine
The machine is encoded in unary format, where each transition is separated by the marker "11"
A transition comprises several parts separated by the marker "1":
1. the current state (e.g. "00" for state q1)
2. the current symbol (e.g. "0000" for symbol X)
3. the next state (e.g. "000" for state q2)
4. the symbol to write (e.g. "00" for symbol 1)
5. the direction to move ("0" for right, "00" for left)

Please note the following:
- The mapping of unary values to symbols is defined in `TAPE_VALUE_ENCODING` within `src/config.ts` and can be customized to suit your requirements.
- The start state is denoted as q0, while the end state is represented as q1.

### FLACI parser
If you don't want to encode the turing machine by hand, you can use the [FLACI](https://flaci.com/home/) parser I have written as a byproduct of this excercise.
It is specifically designed to parse the JSON savefiles from FLACI. To use the parser, follow these steps:

1. Run the command `deno run --allow-read parse-flaci-turing.ts --file [path_to_your_machine_from_flaci].json`.
2. The parser will process the file and generate an encoded Turing machine.
3. The encoded Turing machine will be displayed on the standard output (stdout).

Using the Flaci parser makes it easy for you to get the encoded representation of your Turing machine without having to encode it manually.
