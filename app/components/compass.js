const compassComponent = {
  init() {
    const doty = this.el;
    const compassEl = document.querySelector(".compass");
    const startBtn = document.getElementById("startBtn");
    // const myPoint = document.querySelector('.my-point')

    const isIOS =
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
      navigator.userAgent.match(/AppleWebKit/);

    let pointDegree;
    let compass;
    let rotation;
    let unset = false;

    function handler(e) {
      compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      compassEl.style.transform = `rotate(${-compass}deg)`;

      // rotate doty 180 degrees to face heading
      if (!unset) {
        rotation = compass;
        doty.setAttribute("rotation", `0  ${rotation} 0`);
        unset = true;
      }
    }

    function startCompass() {
      if (isIOS) {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              window.addEventListener("deviceorientation", handler, true);
              const iframe = document.getElementById("mapScene");
              iframe.contentWindow.postMessage("triggerIframeButtonClick", "*");
            } else {
              alert("has to be allowed!");
            }
          })
          .catch(() => alert("not supported"));
      }
    }

    function start() {
      // navigator.geolocation.getCurrentPosition(locationHandler)

      if (isIOS) {
        startBtn.addEventListener("click", startCompass);
      } else if (window.DeviceOrientationEvent && "ontouchstart" in window) {
        window.addEventListener("deviceorientationabsolute", handler, true);
      } else {
        document.querySelector(".compass").style.display = "none";
        console.log("This device does not support compass");
      }
    }

    start();
  },
};
export { compassComponent };
