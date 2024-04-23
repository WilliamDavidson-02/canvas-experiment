import rough from "roughjs";

const generator = rough.generator();

export const createElement = (element, position, options = {}) => {
  let newElement = null;

  if (element === "line") {
    newElement = generator.line(...position, options);
  }

  if (element === "rectangle") {
    const [x1, y1, x2, y2] = position;
    newElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
  }

  return newElement;
};
