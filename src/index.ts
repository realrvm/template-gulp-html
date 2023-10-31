import { user } from "./ts/example";

function init() {
  function createComponent(text: string) {
    const h1 = document.createElement("h1");
    const body = document.querySelector("body") as HTMLBodyElement;
    h1.textContent = text;
    body.append(h1);
  }

  createComponent(user);
}

document.addEventListener("DOMContentLoaded", init);
