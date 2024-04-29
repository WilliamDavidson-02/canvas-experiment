import rough from "roughjs";
import { isInBounds } from "./util";
import { createSelectionIndicator } from "./selection";

const generator = rough.generator();

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

export const selectMarquee = (marquee, elements) => {
  const x1 = Math.min(marquee.x1, marquee.x2);
  const y1 = Math.min(marquee.y1, marquee.y2);
  const x2 = Math.max(marquee.x2, marquee.x1);
  const y2 = Math.max(marquee.y2, marquee.y1);

  let selectedElements = elements.filter((element) =>
    isInBounds(x1, y1, x2, y2, element)
  );

  selectedElements = selectedElements.map((element) => {
    const { x1, y1, x2, y2 } = element;
    const indicator = createSelectionIndicator(x1, y1, x2, y2);

    element.indicator = indicator;

    return element;
  });

  return selectedElements;
};
