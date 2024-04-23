import rough from "roughjs";

const generator = rough.generator();

export const createElement = (type, x1, y1, x2, y2, options = {}) => {
  let newElement = null;

  if (type === "line") {
    newElement = generator.line(x1, y1, x2, y2, options);
  }

  if (type === "rectangle") {
    newElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
  }

  return { type, x1, y1, x2, y2, element: newElement };
};

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
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const positionWithinElement = (x, y, element) => {
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
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || inside;
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
