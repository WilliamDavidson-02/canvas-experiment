import rough from "roughjs";
import { getPadding } from "./util";

const generator = rough.generator();

const distance = (a, b) =>
  // Calculate distance between a & b
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
  const a = { x: x1, y: y1 }; // Star point
  const b = { x: x2, y: y2 }; // End point
  const c = { x, y }; // Cursor

  // Check offset between cursor, a, b and a, b
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 8 && Math.abs(y - y1) < 8 ? name : null;
};

export const positionWithinElement = (x, y, element) => {
  const { type, x1, y1, x2, y2 } = element;

  if (type === "line") {
    const on = onLine(x1, y1, x2, y2, x, y);
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y2, "end");
    return start || end || on;
  } else if (type === "rectangle") {
    const topLeft = nearPoint(x, y, x1, y1, "tl");
    const topRight = nearPoint(x, y, x2, y1, "tr");
    const bottomLeft = nearPoint(x, y, x1, y2, "bl");
    const bottomRight = nearPoint(x, y, x2, y2, "br");
    const top = nearPoint(x, y, x1 + (x2 - x1) / 2, y1, "tc");
    const bottom = nearPoint(x, y, x1 + (x2 - x1) / 2, y2, "bc");
    const left = nearPoint(x, y, x1, y2 - (y2 - y1) / 2, "lc");
    const right = nearPoint(x, y, x2, y2 - (y2 - y1) / 2, "rc");
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return (
      topLeft ||
      topRight ||
      bottomLeft ||
      bottomRight ||
      top ||
      bottom ||
      left ||
      right ||
      inside
    );
  } else {
    throw new Error(`Type not recognised: ${type}`);
  }
};

export const getElementAtPosition = (x, y, elements) => {
  const element = [...elements]
    .reverse()
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);

  return element;
};

export const createSelectionIndicator = (x1, y1, x2, y2, padding = 8) => {
  const newX1 = x1 + getPadding(x2, x1, padding);
  const newY1 = y1 + getPadding(y2, y1, padding);
  const newX2 = x2 + getPadding(x1, x2, padding);
  const newY2 = y2 + getPadding(y1, y2, padding);

  const options = {
    roughness: 0,
    stroke: "rgb(79, 170, 249)",
  };

  const selectionIndicator = generator.rectangle(
    newX1,
    newY1,
    newX2 - newX1,
    newY2 - newY1,
    options
  );

  return selectionIndicator;
};
