import rough from "roughjs";

const generator = rough.generator();

export const createElement = (id, cords, type, options = {}) => {
  const { x1, y1, x2, y2 } = cords;
  let newElement = null;

  if (type === "line") {
    newElement = generator.line(x1, y1, x2, y2, options);
  }

  if (type === "rectangle") {
    newElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
  }

  return { id, type, x1, y1, x2, y2, element: newElement };
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

export const updateElement = (id, cords, type, options, element) => {
  if (["line", "rectangle"].includes(type)) {
    element = createElement(id, cords, type, options);
  }

  return element;
};

export const createMarquee = (x1, y1, x2, y2) => {
  const options = {
    roughness: 0,
    fill: "rgba(255, 255, 255, 0.1)",
    fillStyle: "solid",
    stroke: "rgb(79, 170, 249)",
  };

  const element = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);

  return { element, x1, y1, x2, y2 };
};

export const createSelectionIndicator = (x1, y1, x2, y2, padding = 8) => {
  const newX1 = x1 - padding;
  const newY1 = y1 - padding;
  const newX2 = x2 + padding;
  const newY2 = y2 + padding;

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

export const setElementOffset = (element, x, y) => {
  const offsetX = x - element.x1;
  const offsetY = y - element.y1;

  return { offsetX, offsetY };
};

export const isElementSelected = (elements, target) => {
  return elements.some((e) => e.id === target.id);
};
