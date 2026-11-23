import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCard } from "./load.mjs";

const { hcLabelGroup, hcLabelName, hcFetchEvents, hcDuration, hcSigned, hcThumbPath, hcClipPath } = loadCard("home-camera-card.js", [
  "hcLabelGroup",
  "hcLabelName",
  "hcFetchEvents",
  "hcDuration",
  "hcSigned",
  "hcThumbPath",
  "hcClipPath",
]);

test("objects fall into person, animal, vehicle or other, named in the card's language", () => {
  assert.equal(hcLabelGroup("person"), "person");
  assert.equal(hcLabelGroup("dog"), "animal");
  assert.equal(hcLabelGroup("motorcycle"), "vehicle");
  assert.equal(hcLabelGroup("garbage_can"), "other");
  assert.equal(hcLabelName("fr", "person"), "Personne");
  assert.equal(hcLabelName("de", "cat"), "Katze");
  // Unknown to the dictionaries: Frigate's own label, readable
  assert.equal(hcLabelName("fr", "garbage_can"), "Garbage can");
});

test("events: one request per Frigate instance, merged newest first; a failed instance gives none", async () => {
  const asked = [];
  const hass = {
    callWS: async (msg) => {
      asked.push(msg);
      if (msg.instance_id === "broken") throw new Error("unknown instance");
      if (msg.instance_id === "nas") return JSON.stringify([{ id: "n1", camera: "garden", label: "dog", start_time: 300 }]);
      return [
        { id: "f1", camera: "salon", label: "person", start_time: 100 },
        { id: "f2", camera: "salon", label: "cat", start_time: 500 },
      ];
    },
  };
  const events = await hcFetchEvents(
    hass,
    [
      { name: "salon", instance: "frigate" },
      { name: "garden", instance: "nas" },
      { name: "attic", instance: "broken" },
    ],
    { after: 50.7, limit: 20, labels: ["person"] },
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(events.map((e) => [e.id, e.instance]))),
    [
      ["f2", "frigate"],
      ["n1", "nas"],
      ["f1", "frigate"],
    ],
  );
  const first = asked.find((m) => m.instance_id === "frigate");
  assert.deepEqual(JSON.parse(JSON.stringify(first)), {
    type: "frigate/events/get",
    instance_id: "frigate",
    cameras: ["salon"],
    limit: 20,
    after: 50,
    labels: ["person"],
  });
});

test("durations, an event still going on, and the proxy paths of its thumbnail and clip", () => {
  assert.equal(hcDuration("en", { start_time: 0, end_time: null }), "in progress");
  assert.match(hcDuration("en", { start_time: 0, end_time: 18 }), /^18\s?sec/);
  assert.match(hcDuration("fr", { start_time: 0, end_time: 72 }), /^1\smin 12\ss$/);
  const ev = { id: "17.5-ab", instance: "frigate" };
  assert.equal(hcThumbPath(ev), "/api/frigate/frigate/thumbnail/17.5-ab");
  assert.equal(hcClipPath(ev), "/api/frigate/frigate/notifications/17.5-ab/clip.mp4");
});

test("a signed path is asked once, then reused", async () => {
  let n = 0;
  const hass = {
    callWS: async (msg) => {
      n++;
      return { path: `${msg.path}?authSig=${n}` };
    },
  };
  assert.equal(await hcSigned(hass, "/api/frigate/frigate/thumbnail/x"), "/api/frigate/frigate/thumbnail/x?authSig=1");
  assert.equal(await hcSigned(hass, "/api/frigate/frigate/thumbnail/x"), "/api/frigate/frigate/thumbnail/x?authSig=1");
  assert.equal(n, 1);
});
