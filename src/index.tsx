/** src/index.tsx */
import { h, render } from "preact";
import { App } from "./components/App";

function mount() {
  const root = document.querySelector("app-root");
  if (!root) {
    console.error("❌ <app-root> not found in index.html");
    return;
  }

  // Render the App VComponent inside <app-root>
  // Jet VDOM custom elements behave like normal DOM nodes here
  render(<App />, root);
}

mount();
