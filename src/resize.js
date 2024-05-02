import { updateElement } from "./elements";

export const resizeSingleElement = (x, y, element, position) => {
  const { id, x1, y1, x2, y2, type } = element;
  let cords = { x1, y1, x2, y2 };

  const padding = 8;

  if (position === "tl") {
    cords = { ...cords, x1: x + padding, y1: y + padding };
  } else if (position === "tr") {
    cords = { ...cords, x2: x - padding, y1: y + padding };
  } else if (position === "bl") {
    cords = { ...cords, x1: x + padding, y2: y - padding };
  } else if (position === "br") {
    cords = { ...cords, x2: x - padding, y2: y - padding };
  } else if (position === "tc") {
    cords = { ...cords, y1: y + padding };
  } else if (position === "rc") {
    cords = { ...cords, x2: x + padding };
  } else if (position === "bc") {
    cords = { ...cords, y2: y - padding };
  } else if (position === "lc") {
    cords = { ...cords, x1: x - padding };
  }

  const updatedElement = updateElement(id, cords, type, element, {
    stroke: "white",
  });
  return { ...element, ...updatedElement };
};
