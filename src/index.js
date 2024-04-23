import rough from "roughjs";
import { createElement, getElementAtPosition } from "./util";

const canvas = document.querySelector("#canvas");
const controlBtns = document.querySelectorAll("#element-control");

let mouse = {};
let isDrawing = false;
let elements = [];
let tool = "selection";

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

  const index = elements.length - 1;

  // create a element with inital x,y 1 and x,y 2 with mosue current position
  const { x1, y1 } = elements[index];
  const element = createElement(tool, x1, y1, clientX, clientY, {
    stroke: "white",
  });

  if (!element) return;

  // Replace old element with new
  elements.splice(index, 1, element);
};

const handleMouseDown = (ev) => {
  const { clientX, clientY, target } = ev;

  if (target.nodeName !== "CANVAS") return;

  if (tool === "selection") {
    const element = getElementAtPosition(clientX, clientY, elements);

    if (!element) return;

    console.log(element);
  } else {
    isDrawing = true;

    const element = createElement(tool, clientX, clientY, clientX, clientY, {
      stroke: "white",
    });

    if (!element) return;

    elements.push(element);
  }
};

const handleMouseUp = () => {
  isDrawing = false;
};

const draw = () => {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const rc = rough.canvas(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach(({ element }) => rc.draw(element));
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
