import rough from "roughjs";
import { createLine } from "./util";

const canvas = document.querySelector("#canvas");

let initPosition = null;
let mouse = {};
let isDrawing = false;
let elements = [];

const handleWindowSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const handleMouseMove = ({ clientX, clientY }) => {
  mouse.x = clientX;
  mouse.y = clientY;

  if (!isDrawing) return;

  // create a element with inital x,y 1 and x,y 2 with mosue current position
  const { x, y } = initPosition;
  const element = createLine(x, y, clientX, clientY);

  // Replace old element with new
  const index = elements.length - 1;
  elements.splice(index, 1, element);
};

const handleMouseDown = ({ clientX, clientY }) => {
  isDrawing = true;

  initPosition = { x: clientX, y: clientY };

  const element = createLine(clientX, clientY, clientX, clientY);
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
  requestAnimationFrame(draw);
};

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", init);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);
