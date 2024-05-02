import rough from "roughjs";
import { calcCords, isElementSelected, setElementOffset } from "./util";
import { createElement, updateElement } from "./elements";
import { createSelectionIndicator, getElementAtPosition } from "./selection";
import { createMarquee, selectMarquee } from "./marquee";
import { createSelectionHandles } from "./handles";
import { resizeSingleElement } from "./resize";

const canvas = document.querySelector("#canvas");
const controlBtns = document.querySelectorAll("#element-control");

let mouse = {};
let isDrawing = false;
let elements = [];
let selectedElements = [];
let tool = "selection";
let action = null;
let marquee = null;
let selectionHandle = null;
let selectedHandle = null;

const toggleElementBtns = (type) => {
  if (!controlBtns) return;

  controlBtns.forEach((btn) => {
    const btnType = btn.getAttribute("data-element");
    if (btnType !== type) {
      btn.classList.remove("selected");
    } else {
      btn.classList.add("selected");
    }
  });
};

const handleElementType = (btn) => {
  const type = btn.getAttribute("data-element");

  tool = type;

  if (type === "selection") {
    action = "move";
  } else if (["line", "rectangle"].includes(type)) {
    action = "drawing";
    selectedElements = [];
    selectionHandle = null;
  }

  toggleElementBtns(type);
};

const handleKeyDown = ({ key }) => {
  if (!isNaN(key)) {
    const btn = controlBtns[Number(key) - 1];

    if (!btn) return;

    handleElementType(btn);
  }
};

const handleWindowSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const handleMouseMove = ({ clientX, clientY }) => {
  mouse.x = clientX;
  mouse.y = clientY;

  if (!isDrawing) return;

  if (action === "drawing") {
    const index = elements.length - 1;

    // create a element with inital x,y 1 and x,y 2 with mosue current position
    const { x1, y1, id } = elements[index];
    const cords = { x1, y1, x2: clientX, y2: clientY };
    const element = createElement(id, cords, tool, { stroke: "white" });

    if (!element) return;

    // Replace old element with new
    elements.splice(index, 1, element);
  } else if (action === "moving") {
    selectedElements.forEach((selectedElement, index) => {
      const { x1, y1, x2, y2, type, offsetX, offsetY, id } = selectedElement;

      const data = { x1, y1, x2, y2, clientX, clientY, offsetX, offsetY };

      const cords = calcCords(data);

      const updatedElement = updateElement(id, cords, type, selectedElement, {
        stroke: "white",
      });

      elements[id] = updatedElement;

      const indicator = createSelectionIndicator(...Object.values(cords));
      selectedElements[index].indicator = indicator;
      Object.keys(cords).map((key) => {
        return (selectedElements[index][key] = cords[key]);
      });
      selectionHandle = createSelectionHandles(selectedElements);
    });
  } else if (action === "marquee") {
    const { x1, y1 } = marquee;
    marquee = createMarquee(x1, y1, clientX, clientY);

    if (!elements.length) return;

    selectedElements = selectMarquee(marquee, elements);
    selectionHandle = createSelectionHandles(selectedElements);
  } else if (action === "resizing" && selectedHandle) {
    if (selectedElements.length === 1) {
      const element = selectedElements[0];

      const resizedElement = resizeSingleElement(
        clientX,
        clientY,
        element,
        selectedHandle.position
      );

      const { x1, y1, x2, y2 } = resizedElement;
      selectionHandle = createSelectionHandles([resizedElement]);
      const indicator = createSelectionIndicator(x1, y1, x2, y2);

      elements[element.id] = resizedElement;
      selectedElements[element.id] = resizedElement;
      selectedElements[element.id].indicator = indicator;
    }
  }
};

const setSelectedOffset = (elements, x, y) => {
  if (elements.length) {
    return elements.map((element) => {
      const { offsetX, offsetY } = setElementOffset(element, x, y);

      return { ...element, offsetX, offsetY };
    });
  }

  const element = elements;
  const { offsetX, offsetY } = setElementOffset(element, x, y);

  return { ...element, offsetX, offsetY };
};

const setSelectedElements = (ev, element) => {
  const { x1, y1, x2, y2 } = element;
  const { clientX, clientY, shiftKey } = ev;

  const indicator = createSelectionIndicator(x1, y1, x2, y2);
  let selected = setSelectedOffset(element, clientX, clientY);
  selected.indicator = indicator;

  const isSelected = isElementSelected(selectedElements, element);

  if (!isSelected) {
    if (shiftKey) {
      selectedElements = setSelectedOffset(selectedElements, clientX, clientY);

      selectedElements.push(selected);
    } else {
      selectedElements = [selected];
    }
  } else {
    selectedElements = setSelectedOffset(selectedElements, clientX, clientY);
  }
};

const handleMouseDown = (ev) => {
  const { clientX, clientY, target } = ev;

  if (target.nodeName !== "CANVAS") return;

  isDrawing = true;

  if (tool === "selection") {
    const element = getElementAtPosition(clientX, clientY, elements);
    const handle = selectionHandle
      ? getElementAtPosition(clientX, clientY, [selectionHandle])
      : null;

    if (!element && !handle) {
      selectedElements = [];
      selectionHandle = null;
      action = "marquee";
      marquee = createMarquee(clientX, clientY, clientX, clientY);
      return;
    }

    if (element) {
      setSelectedElements(ev, element);
    } else {
      selectedElements = setSelectedOffset(selectedElements, clientX, clientY);
    }

    selectionHandle = createSelectionHandles(selectedElements);

    const isInsideElement = element ? element.position === "inside" : null;
    const isInsideHandle = handle ? handle.position === "inside" : null;

    action = isInsideElement || isInsideHandle ? "moving" : "resizing";
    if (isInsideElement || isInsideHandle) {
      action = "moving";
    } else {
      action = "resizing";
      selectedHandle = handle;
    }
  } else {
    const id = elements.length;
    const cords = { x1: clientX, y1: clientY, x2: clientX, y2: clientY };
    const element = createElement(id, cords, tool, { stroke: "white" });

    if (element) elements.push(element);
    action = "drawing";
  }
};

const handleMouseUp = () => {
  isDrawing = false;
  action = marquee = null;
  selectedHandle = null;
};

const draw = () => {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const rc = rough.canvas(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach(({ element }) => rc.draw(element));
  selectedElements.forEach(({ indicator }) => rc.draw(indicator));

  if (marquee) rc.draw(marquee.element);

  if (selectionHandle) {
    const { border, handles } = selectionHandle;

    rc.draw(border);
    handles.forEach(({ handle }) => rc.draw(handle));
  }

  requestAnimationFrame(draw);
};

const init = () => {
  handleWindowSize();
  toggleElementBtns(tool);
  requestAnimationFrame(draw);
};

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", init);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);

window.addEventListener("keydown", handleKeyDown);
controlBtns.forEach((btn) => {
  btn.addEventListener("click", () => handleElementType(btn));
});
