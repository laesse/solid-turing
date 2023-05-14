import config from './config';
import { HashMap } from './hashMap';

export type Instructions = ReturnType<typeof parseProgramm>;

export const parseProgramm = (tape: string) => {
  return new HashMap(
    tape.split('11').map((transition) => {
      const tranitionParts = transition.split('1').filter((a) => a);
      if (tranitionParts.length != 5) throw Error(`invalid transition, ${transition}`);
      return [
        [tranitionParts[0].length, config.TAPE_VALUE_ENCODING[tranitionParts[1].length - 1]],
        [
          tranitionParts[2].length,
          config.TAPE_VALUE_ENCODING[tranitionParts[3].length - 1],
          tranitionParts[4].length,
        ],
      ] as const;
    })
  );
};
