
# Turing Machine Emulator
This app was developed for my theoretical Computer Science class. It is a universal turing machine emulator. It is a web app that allows the user to visualize and run a turing machine.
![image](https://github.com/laesse/solid-turing/assets/40475367/9a1a17f0-d042-4513-b647-ce81745f454a)

## How to use
1. Clone the repository
2. run `pnpm install && pnpm dev`
3. Open your browser and go to [localhost:3000/solid-turing](http://localhost:3000/solid-turing)

## Running other machines
The task was to build a Turing machine for multiplication, which is now included in the app. The multiplication function is directly programmed into the application. If you want to make changes to the machine's behavior, simply modify the `machine` variable in the `src/config.ts` file. In the same file you can also change default tape value.

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

#### Example

**our multiplication machine:**

```text
0100100000000000001001011010101010110000000000000101000000000000010101100000000000001000100010010011000000000000010010001001001100010100010100110001001000010010110000100001000010000101100001010000010000100110000100100100010110000010010000001001001100000100001000001000010011000000101000000010000010110000001000001000000100000100110000001000100000000000010001011000000010000010000000100000101100000001001000000001001011000000001010000000010101100000000100001000000001000010110000000010010000000001001011000000000101000000000101011000000000100010000000000101001100000000001001000000000001001001100000000001010000000000101001100000000000100100000010010011000000000001000010000000000010000100110000000000010100000000000101001100000000000010010000100101100000000000010000010000000000001010
```

### FLACI parser
If you don't want to encode the turing machine by hand, you can use the [FLACI](https://flaci.com/home/) parser.
It is specifically designed to parse the JSON savefiles from FLACI. To use the parser, follow these steps:

1. Run the command `deno run --allow-read parse-flaci-turing.ts --file [path_to_your_machine_from_flaci].json`.
2. The parser will process the file and generate an encoded Turing machine.
3. The encoded Turing machine will be displayed on the standard output (stdout).

Using the Flaci parser makes it easy for you to get the encoded representation of your Turing machine without having to encode it manually.
