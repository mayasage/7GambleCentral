import { randomInt } from "crypto";

// 1_00_000_000 in 2s with randomInt

const iterations = 1_00_000_000;

console.time("crypto.randomInt");
for (let i = 0; i < iterations; i++) {
  randomInt(1, 100);
}
console.timeEnd("crypto.randomInt");

console.time("Math.random");
for (let i = 0; i < iterations; i++) {
  Math.floor(Math.random() * 100) + 1;
}
console.timeEnd("Math.random");
