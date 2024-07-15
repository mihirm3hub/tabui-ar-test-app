import {handleSplashScreen} from "./handleSplashScreen.js";

const getDataComponent = {
    lastRequestTime: 0, // Track the time of the last request

    init() {
        this.array = [];
        this.distArray = [];
        this.sceneAssets = document.querySelector("a-assets");
        this.map = document.querySelector("lightship-map");
        this.isPlaying = true;

        this.initializeGeolocation();
    },

    initializeGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    this.handlePost(latitude, longitude);
                },
                (error) => console.error("Error getting location:", error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 30000,
                    timeout: 5000,
                }
            );
        } else {
            console.error("Geolocation API is not supported.");
        }
    },

    handlePost(lat, long) {
        const currentTime = Date.now();
        if (currentTime - this.lastRequestTime < 5000) {
            return;
        }

        this.lastRequestTime = currentTime;

        fetch("https://api.tabuiapp.it/api/api-for-ar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({latitude: lat, longitude: long}),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("API response:", data);
                this.handleResult(data.response);
            })
            .catch((error) => console.error("Error:", error));
    },

    handleResult(data) {
        console.log("exec handle API data");
        data.forEach((item) => {
            if (!this.array.includes(item.id)) {
                this.array.push(item.id);
                this.distArray.push(item.distance);

                const maxDistance = Math.max(...this.distArray);
                const radius = Math.round((maxDistance + 1) * 1000);
                this.map.setAttribute("radius", `${radius}`);

                this.createMapPoint(item);
            } else {
                this.updateMapPointDistance(item);
            }
        });

        handleSplashScreen();
    },

    createMapPoint(item) {
        const {
            name_complete,
            distance,
            position,
            url_img_new,
        } = item;
        const scaleVal = (distance * 100).toFixed(1);
        const result = this.calculateScale(scaleVal);

        const newEle = document.createElement("lightship-map-point");
        newEle.id = name_complete;
        newEle.setAttribute(
            "lat-lng",
            `${position.split(" ")[0]} ${position.split(" ")[2]}`
        );
        newEle.setAttribute("no-cull", "");
        newEle.innerHTML = `
      <a-entity
        id="${name_complete}"
        look-at="#camera"
        no-cull
        geometry="primitive: plane; height:2.25; width: 5.55"
        material="shader: flat; src: #test-image; alphaTest:0.5; side:double;"
        scale="${result} ${result} ${result}"
        position="0 8 0"
        class="cantap infoTab"
        shadow
      >
        <a-image material="shader: flat; src: #test-image; alphaTest:0.03; side:double; transparent:true;" position="0 0 -0.01" width="5.55" height="2.25"></a-image>
        <!-- <a-rounded position="-2.29 -0.78 0.02" scale="2.15 1.96 1" material="shader: flat; alphaTest:0.5; src: url(${url_img_new})" crossorigin="Anonymous" width="0.8" height="0.8" radius="0.28" opacity="1"></a-rounded> -->
        <a-entity text="value:${name_complete}; color:#3B3A4C; anchor:align; letterSpacing:-2.5; wrapCount:20; zOffset:0.020; shader: msdf; font:./components/Lexend-Regular-msdf.json; fontImage:https://cdn.glitch.global/8ae63d15-3d0c-4bfd-b44d-6bca726f4d53/Lexend-Regular.png; negate:false;" position="-0.45 0 0" scale="2.5 2.5 2.5"></a-entity>
        <a-text id="${name_complete}-distance" value="${distance.toFixed(
            1
        )} km" position="1 -0.7 0.02" scale="1 0.9 1" letterSpacing="-2.5" color="#3B3A4C" shader="msdf" font="https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/karla/Karla-Bold.json"></a-text>
        <a-image material="shader: flat; src: #icon-image; alphaTest:0.5; side:double; transparent:true;" position="1.85 -0.5 0.02" scale=".5 .5 .5" width="0.5" height="0.5"></a-image>
      </a-entity>
    `;
        this.map.appendChild(newEle);
        this.setupPopup(newEle, item);
    },

    updateMapPointDistance(item) {
        const tab = document.getElementById(`${item.name_complete}`);
        if (tab) {
            const distanceElem = document.getElementById(
                `${item.name_complete}-distance`
            );
            distanceElem.removeAttribute("value");
            distanceElem.setAttribute("value", `${item.distance.toFixed(1)} km`);
        }
    },

    calculateScale(scaleVal) {
        let multiplier;

        if (scaleVal < 10) {
            multiplier = 1.35;
        } else if (scaleVal < 30) {
            multiplier = 1.2;
        } else if (scaleVal < 60) {
            multiplier = 1;
        } else if (scaleVal < 100) {
            multiplier = 0.8;
        } else {
            multiplier = 0.5;
        }

        return scaleVal * multiplier;
    },

    setupPopup(element, item) {
        const {name_complete, description, distance, url_img_preview, url} = item;
        const tabPopup = document.getElementById("tab-popup");
        const popImage = document.getElementById("popup-content-image");
        const popTitle = document.getElementById("pop-title");
        const popDistance = document.getElementById("pop-dist");
        const popupCta = document.getElementById("popup-content-cta");
        const popDesc = document.getElementById("popup-content-desc");

        element.addEventListener("click", () => {
            popTitle.innerHTML = name_complete;
            popDesc.innerHTML = description;
            popDistance.innerHTML = `${distance.toFixed(1)} km`;
            popImage.src = url_img_preview;
            tabPopup.style.display = "flex";
            tabPopup.classList.add("fade-in");
            tabPopup.classList.remove("fade-out");

            popupCta.addEventListener("click", () => {
                window.location = url;
                console.log(url);
            });
        });
    },
};

export {getDataComponent};
