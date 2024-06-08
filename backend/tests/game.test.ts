import supertest from "supertest";
import server from "../src/app";

const sapp = supertest(server);

describe("game", () => {
  test("roll_die", async () => {
    const res = await supertest(server).get("/api/game/roll_die").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((num: number) => Number.isInteger(num))).toBe(true);
    expect(res.body.every((num: number) => num >= 1 && num <= 7)).toBe(true);
  });

  test("win_or_loss", async () => {
    const invalid = [
      { die: [1, 2], bet: "7u" },
      { die: [1, 2], bet: "7" },
      { die: [7, 2], bet: "7d" },
    ];
    const resF = await Promise.all(
      invalid.map((o) => sapp.post("/api/game/win_or_loss").send(o)),
    );
    resF.forEach((o) => {
      expect(o.status).toBe(200);
      expect(o.body).toBeFalsy();
    });

    const valid = [
      { die: [1, 2], bet: "7d" },
      { die: [2, 5], bet: "7" },
      { die: [3, 5], bet: "7u" },
    ];
    const resT = await Promise.all(
      valid.map((o) => sapp.post("/api/game/win_or_loss").send(o)),
    );
    resT.forEach((o) => {
      expect(o.status).toBe(200);
      expect(o.body).toBeTruthy();
    });

    const error = [
      { die: [8, 2], bet: "7d" },
      { die: [], bet: "7" },
      { die: [3], bet: "7u" },
    ];
    const resE = await Promise.all(
      error.map((o) => sapp.post("/api/game/win_or_loss").send(o)),
    );
    resE.forEach((o) => {
      expect(o.status).toBe(400);
    });
  });

  test("updates chips correctly for different scenarios", async () => {
    const testCases = [
      { die: [1, 2], bet: "7u", chips: 10, expectedUpdatedChips: 10 },
      { die: [1, 2], bet: "7", chips: 10, expectedUpdatedChips: 10 },
      { die: [7, 2], bet: "7d", chips: 10, expectedUpdatedChips: 10 },
      { die: [1, 2], bet: "7d", chips: 10, expectedUpdatedChips: 20 },
      { die: [7, 2], bet: "7u", chips: 10, expectedUpdatedChips: 20 },
      { die: [5, 2], bet: "7", chips: 10, expectedUpdatedChips: 50 },
    ];

    // Send a POST request for each test case and validate the response
    await Promise.all(
      testCases.map(async (testCase) => {
        const response = await sapp
          .post("/api/game/update_chips")
          .send(testCase)
          .expect(200);

        const score = testCase.die[0] + testCase.die[1];
        let expectedWinRate = 0;
        if (
          (testCase.bet === "7u" && score > 7) ||
          (testCase.bet === "7d" && score < 7)
        ) {
          expectedWinRate = 2;
        }
        if (testCase.bet === "7" && score === 7) {
          expectedWinRate = 5;
        }

        const expectedUpdatedChips = expectedWinRate
          ? expectedWinRate * testCase.chips
          : testCase.chips;

        expect(response.body).toEqual({ updatedChips: expectedUpdatedChips });
      }),
    );
  });
});

afterAll((done) => {
  server.close(done);
});
