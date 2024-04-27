import rough from "roughjs";
import {
  createElement,
  createMarquee,
  getElementAtPosition,
  updateElement,
} from "./util";

const canvas = document.querySelector("#canvas");
const controlBtns = document.querySelectorAll("#element-control");

let mouse = {};
let isDrawing = false;
let elements = [];
let selectedElement = null;
let tool = "selection";
let action = null;
let marquee = null;

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
  }

  toggleElementBtns(type);
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
    const { x1, y1, x2, y2, type, offsetX, offsetY, id } = selectedElement;

    const width = x2 - x1;
    const height = y2 - y1;
    const newX1 = clientX - offsetX;
    const newY1 = clientY - offsetY;

    const cords = {
      x1: newX1,
      y1: newY1,
      x2: newX1 + width,
      y2: newY1 + height,
    };

    elements = updateElement(id, cords, type, { stroke: "white" }, elements);
  } else if (action === "marquee") {
    const { x1, y1 } = marquee;
    marquee = createMarquee(x1, y1, clientX, clientY);
  }
};

const handleMouseDown = (ev) => {
  const { clientX, clientY, target } = ev;

  if (target.nodeName !== "CANVAS") return;

  isDrawing = true;

  if (tool === "selection") {
    const element = getElementAtPosition(clientX, clientY, elements);

    if (!element) {
      action = "marquee";
      marquee = createMarquee(clientX, clientY, clientX, clientY);
      return;
    }

    const offsetX = clientX - element.x1;
    const offsetY = clientY - element.y1;
    selectedElement = { ...element, offsetX, offsetY };

    if (element.position === "inside") {
      action = "moving";
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
};

const draw = () => {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const rc = rough.canvas(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach(({ element }) => rc.draw(element));

  if (marquee) rc.draw(marquee.element);

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

controlBtns.forEach((btn) => {
  btn.addEventListener("click", () => handleElementType(btn));
});
