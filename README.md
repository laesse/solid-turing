
# Turing Machine 
This app was developed for THIN. It is a Turing Machine Simulator. It is a web app that allows the user to visualize and run a turing machine.

## How to use
1. Clone the repository
2. run `pnpm install && pnpm dev`
3. Open your browser and go to `localhost:3000`


### flaci parser
If you want to run diffrent machines, you can use the flaci parser. It is a parser for the JSON savefile.
To use it run `deno run --allow-read parse-flaci-turing.ts --file [path_your_machine_from_flaci].json`
it will print a encoded turing machine to stdout. You can copy this and paste it into the `src/App.tsx` file.
The turing machine is currently hardcoded into the app. To change the turing machine, you have to change the code in `src/pages/index.tsx` and change the `machine` variable.