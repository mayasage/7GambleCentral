import { randomInt, randomUUID } from 'crypto';

export default {
  int: (min: number, max: number) => {
    return randomInt(min, max + 1);
  },
  uuid: () => {
    return randomUUID();
  },
};
