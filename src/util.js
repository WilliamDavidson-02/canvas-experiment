export const isInBounds = (x1, y1, x2, y2, element) => {
  const x = x1 <= element.x1 && x2 >= element.x2;
  const y = y1 <= element.y1 && y2 >= element.y2;

  return x && y;
};

export const getAxisValues = (axis, elements) => {
  return elements.map((e) => e[axis]);
};

export const setElementOffset = (element, x, y) => {
  const offsetX = x - element.x1;
  const offsetY = y - element.y1;

  return { offsetX, offsetY };
};

export const isElementSelected = (elements, target) => {
  return elements.some((e) => e.id === target.id);
};

export const calcCords = (data) => {
  const { x1, y1, x2, y2, clientX, clientY, offsetX, offsetY } = data;

  const width = x2 - x1;
  const height = y2 - y1;
  const newX1 = clientX - offsetX;
  const newY1 = clientY - offsetY;

  return {
    x1: newX1,
    y1: newY1,
    x2: newX1 + width,
    y2: newY1 + height,
  };
};
