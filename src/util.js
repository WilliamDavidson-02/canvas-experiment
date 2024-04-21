import rough from "roughjs";

const generator = rough.generator();

export const createLine = (x1, y1, x2, y2) => {
  return generator.line(x1, y1, x2, y2);
};
