import rough from "roughjs";
import { getAxisValues } from "./util";

const generator = rough.generator();

const createHandle = (x, y, position, width = 6) => {
  const newX1 = x - width;
  const newY1 = y - width;
  const newX2 = x + width;
  const newY2 = y + width;

  const handle = generator.rectangle(
    newX1,
    newY1,
    newX2 - newX1,
    newY2 - newY1,
    {
      roughness: 0,
      stroke: "rgb(79, 170, 249)",
      fill: "rgb(20, 20, 20)",
      fillStyle: "solid",
    }
  );

  return { handle, position, x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
};

export const createSelectionHandles = (elements, padding = 8) => {
  const x1 = Math.min(...getAxisValues("x1", elements));
  const y1 = Math.min(...getAxisValues("y1", elements));
  const x2 = Math.max(...getAxisValues("x2", elements));
  const y2 = Math.max(...getAxisValues("y2", elements));

  const newX1 = x1 - padding;
  const newY1 = y1 - padding;
  const newX2 = x2 + padding;
  const newY2 = y2 + padding;

  const border = generator.rectangle(
    newX1,
    newY1,
    newX2 - newX1,
    newY2 - newY1,
    {
      roughness: 0,
      stroke: "rgb(79, 170, 249)",
      strokeLineDash: [5],
      strokeWidth: 0.3,
    }
  );

  const topLeft = createHandle(newX1, newY1, "tl");
  const topRight = createHandle(newX2, newY1, "tr");
  const bottomLeft = createHandle(newX1, newY2, "bl");
  const bottomRight = createHandle(newX2, newY2, "br");

  let handles = [topLeft, topRight, bottomLeft, bottomRight];

  if (elements.length === 1) {
    const topCenter = createHandle(newX1 + (newX2 - newX1) / 2, newY1, "tc");
    const rightCenter = createHandle(newX2, newY1 + (newY2 - newY1) / 2, "rc");
    const bottomCenter = createHandle(newX1 + (newX2 - newX1) / 2, newY2, "bc");
    const leftCenter = createHandle(newX1, newY1 + (newY2 - newY1) / 2, "lc");

    handles = [...handles, topCenter, rightCenter, bottomCenter, leftCenter];
  }

  return {
    handles,
    border,
    x1: newX1,
    y1: newY1,
    x2: newX2,
    y2: newY2,
    type: "rectangle",
  };
};
