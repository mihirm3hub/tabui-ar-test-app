console.log("exec data script");
import {handleSplashScreen} from "./handleSplashScreen.js";

const getDataComponent = {
    init() {
        this.array = [];
        this.distArray = [];

        this.map = document.querySelector("lightship-map");

        if (navigator.geolocation) {
            // Geolocation API is supported
            navigator.geolocation.watchPosition(
                (position) => {
                    // This function will be called whenever the position changes
                    const {latitude} = position.coords;
                    const {longitude} = position.coords;
                    // console.log('Location changed:', latitude, longitude)
                    //this.handlePost(44.477516915593, 7.8749787)
                    this.handlePost(latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                },
                {
                    enableHighAccuracy: true, // Optional: Try to get the most accurate position
                    maximumAge: 30000, // Optional: Use cached position if it's less than 30 seconds old
                    timeout: 5000, // Optional: Timeout after 5 seconds
                }
            );
        } else {
            console.error("Geolocation API is not supported.");
        }
    },
    handlePost(lat, long) {
        // console.log("POST:", "\n", { latitude: lat }, { "longitude:": long });

        fetch("https://api.tabuiapp.it/api/api-for-ar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                latitude: lat, // Replace with your actual latitude
                longitude: long, // Replace with your actual longitude
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log("API response:", data);
                // Handle the API response here
                this.handleResult(data);
            })
            .catch((error) => {
                console.error("Error:", error);
                // Handle errors here
            });
    },
    handleResult(data) {
        for (let i = 0; i < data.length; i++) {
            if (!this.array.includes(data[i].id)) {
                this.array.push(data[i].id);
                this.distArray.push(data[i].distance);
                // find max distance in the distance array [this.distArray]
                const maxDistance = Math.max.apply(null, this.distArray);
                // calculate radius add 1km extra radius & convert km to m
                const radius = Math.round(
                    (parseFloat(parseFloat(maxDistance, 10).toFixed(1)) + 1) * 1000
                );
                // console.log("arr:", this.distArray);
                // set map radius
                this.map.setAttribute("radius", `${radius}`);

                // create title and sub-title
                // create title and sub-title
                const location = data[i].name_complete;
                // const [location, city] = data[i].name.split("-");
                // console.log(location, city)
                // const cityName = city !== undefined ? city : "NA";
                // calculate dynamic scale based on distance
                // dynamic scaling
                const scaleVal = (data[i].distance * 100).toFixed(1);
                let multiplier = 0;

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

                const result = scaleVal * multiplier;
                // console.log("result:", result);

                // create map-points
                const newEle = document.createElement("lightship-map-point");
                newEle.id = data[i].name;
                newEle.setAttribute(
                    "lat-lng",
                    `${data[i].position.split(" ")[0]} ${data[i].position.split(" ")[2]}`
                );
                newEle.setAttribute("no-cull", "");
                // create location tabs attributes can be edited to suitable results
                // width and height will also change the sizing of the tabs (not recommended as every other child element would need to be adjusted accordingly)
                newEle.insertAdjacentHTML(
                    "beforeend",
                    `
          <a-entity
            id="${data[i].name_complete}"
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
            <a-rounded position="-2.29 -0.78 0.02" scale="2.15 1.96 1" material="shader: flat; alphaTest:0.5; 
              src: url(${data[i].url_img})" crossorigin="Anonymous" 
              width="0.8" height="0.8" radius="0.28" opacity="1"
            ></a-rounded>
            <a-entity 
              text="value:${location}; color:#3B3A4C; anchor:align; letterSpacing:-2.5; wrapCount:20; zOffset:0.020; shader: msdf; font:./components/Lexend-Regular-msdf.json; fontImage:https://cdn.glitch.global/8ae63d15-3d0c-4bfd-b44d-6bca726f4d53/Lexend-Regular.png; negate:false;" 
              position="-0.45 0 0" 
              scale="2.5 2.5 2.5">
            </a-entity>
            <a-text 
              id="${data[i].name_complete}-distance"
              value="${data[i].distance.toFixed(1)} km" 
              position="1 -0.7 0.02" scale="1 0.9 1" letterSpacing="-2.5" color="#3B3A4C" 
              shader="msdf" font="https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/karla/Karla-Bold.json"
            ></a-text> 
            <a-image material="shader: flat; src: #icon-image; alphaTest:0.5; side:double; transparent:true;" position="1.85 -0.5 0.02" scale=".5 .5 .5" width="0.5" height="0.5"></a-image>
          </a-entity>
         `
                );

                this.map.appendChild(newEle);
                console.log("tabs created");

                // Add tab popup content
                const tabPopup = document.getElementById("tab-popup");
                const popImage = document.getElementById("popup-content-image");
                const popTitle = document.getElementById("pop-title");
                const popDistance = document.getElementById("pop-dist");
                const popDesc = document.getElementById("popup-content-desc");
                const activeTabs = document.querySelectorAll(".infoTab");

                // Get index of the selected tab
                const findIndexByName = (name) => {
                    return data.findIndex((obj) => obj.name_complete === name);
                };

                // Click function for location tabs
                activeTabs.forEach((el) => {
                    el.addEventListener("click", () => {
                        const index = findIndexByName(el.id); // use the index to map respective tab content
                        // console.log('tab clicked',index, data[index])
                        popTitle.innerHTML = data[index].name_complete;
                        popDesc.innerHTML = data[index].description;
                        popDistance.innerHTML = `${data[index].distance.toFixed(1)} km`;
                        popImage.src = data[index].url_img;
                        tabPopup.style.display = "flex";
                        tabPopup.classList.add("fade-in");
                        tabPopup.classList.remove("fade-out");
                    });
                });
            } else {
                // console.log(this.array.includes(data[i].id));
            }
            // dynamic distance values
            const tab = document.getElementById(`${data[i].name_complete}`);
            if (tab) {
                document
                    .getElementById(`${data[i].name_complete}-distance`)
                    .removeAttribute("value");
                document
                    .getElementById(`${data[i].name_complete}-distance`)
                    .setAttribute("value", `${data[i].distance.toFixed(1)} km`);
            }
            if (i === data.length - 1) {
                // remove splash screen once everything is created
                handleSplashScreen();
            }
        }
    },
};
export {getDataComponent};

