import db from "../../db.json";
import {
  buildSelectedCharacterUrl,
  DEFAULT_JSON_SERVER_PORT,
  isSelectedCharacterPayload,
} from "./jsonServer";

describe("json-server config", () => {
  it("buildSelectedCharacterUrl uses explicit port", () => {
    expect(buildSelectedCharacterUrl("5050")).toBe(
      "http://localhost:5050/selectedCharacter",
    );
  });

  it("buildSelectedCharacterUrl falls back to default port", () => {
    expect(buildSelectedCharacterUrl()).toBe(
      `http://localhost:${DEFAULT_JSON_SERVER_PORT}/selectedCharacter`,
    );
    expect(buildSelectedCharacterUrl("   ")).toBe(
      `http://localhost:${DEFAULT_JSON_SERVER_PORT}/selectedCharacter`,
    );
  });
});

describe("db.json schema", () => {
  it("selectedCharacter record matches expected payload", () => {
    const selectedCharacter = (db as { selectedCharacter?: unknown })
      .selectedCharacter;

    expect(isSelectedCharacterPayload(selectedCharacter)).toBe(true);
  });

  it("invalid payload does not pass schema validation", () => {
    const invalidPayload = {
      id: "1",
      characterId: "7",
      character: null,
    };

    expect(isSelectedCharacterPayload(invalidPayload)).toBe(false);
  });
});
