import "../css/style.css";
import $ from 'jquery'
console.log(111);
console.log($);
// import { add } from "./print";
// add(3, 4);

// import(/* webpackChunkName: 'print' */ "./print").then(data => {
//     // eslint-disable-next-line
//     console.log(data);
//   });

document.getElementById("btn");
document.getElementById("btn").onclick = () => {
  import(/* webpackChunkName: 'print' */ "./print").then(data => {
    // eslint-disable-next-line
    alert(data.add(2, 5));
  });
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-Worker.js")
      .then(() => {
        console.log("注册成功");
      })
      .catch(() => {
        console.log("注册失败");
      });
  });
}
