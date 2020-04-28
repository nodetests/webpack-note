import "../css/style.css";
import { haha } from "./print.js";
const demo = (a, b) => {
  return a + b;
};
haha();

console.log(demo(3, 4));
console.log(demo(3, 4));
if (module.hot) {
  module.hot.accept("./print.js", function() {
    haha();
  });
}
