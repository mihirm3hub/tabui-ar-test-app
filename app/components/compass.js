const compassComponent = {
    init() {
        const entity = this.el;
        const compassEl = document.querySelector(".compass");
        const startBtn = document.getElementById("startBtn");
        // const myPoint = document.querySelector('.my-point')

        const isIOS =
            navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
            navigator.userAgent.match(/AppleWebKit/);

        let compass;
        let rotation;
        let unset = false;

        /*
         * Handles the device orientation event, updating the compass and entity's rotation.
         * @param {Object} e - The event object from the device orientation event.
         */
        function handler(e) {
            compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
            compassEl.style.transform = `rotate(${-compass}deg)`;

            // rotate entity 180 degrees to face heading
            if (!unset) {
                rotation = compass;
                entity.setAttribute("rotation", `0  ${rotation} 0`);
                unset = true;
            }
        }

        /**
         * Requests permission for and starts the compass if on iOS, otherwise alerts the user.
         */
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

        /**
         * Initializes the compass functionality based on the device's capabilities.
         */
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
export {compassComponent};
