import { handler } from "../src";

describe("handler", () => {
    test("OK", async () => {
        expect(await handler({ message: "test" })).toStrictEqual({
            statusCode: 200,
            body: {
                message: "test",
            },
        });
    });
});
