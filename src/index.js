import rough from "roughjs";
import { createElement } from "./util";

const canvas = document.querySelector("#canvas");
const controlBtns = document.querySelectorAll("#element-control");

let initPosition = null;
let mouse = {};
let isDrawing = false;
let elements = [];
let elementType = "line";

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

  elementType = type;

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

  // create a element with inital x,y 1 and x,y 2 with mosue current position
  const position = [initPosition.x, initPosition.y, clientX, clientY];
  const element = createElement(elementType, position, { stroke: "white" });

  // Replace old element with new
  const index = elements.length - 1;
  elements.splice(index, 1, element);
};

const handleMouseDown = (ev) => {
  const { clientX, clientY, target } = ev;

  if (target.nodeName !== "CANVAS") return;
  isDrawing = true;

  initPosition = { x: clientX, y: clientY };

  const position = [clientX, clientY, clientX, clientY];
  const element = createElement(elementType, position, { stroke: "white" });
  elements.push(element);
};

const handleMouseUp = () => {
  isDrawing = false;
  initPosition = null;
};

const draw = () => {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const rc = rough.canvas(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach((element) => rc.draw(element));
  requestAnimationFrame(draw);
};

const init = () => {
  handleWindowSize();
  toggleElementBtns(elementType);
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
