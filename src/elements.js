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

export const updateElement = (id, cords, type, options, element) => {
  if (["line", "rectangle"].includes(type)) {
    element = createElement(id, cords, type, options);
  }

  return element;
};
