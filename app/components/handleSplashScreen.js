// Handle splash screen based on device OS
export const handleSplashScreen = () => {
    const scene = document.querySelector('a-scene');
    const gradient = document.getElementById("gradient");
    const start = document.getElementById("startBtn");
    const spinner = document.querySelector(".spinner");
    let isVisible = false;
    const IS_IOS =
      /^(iPad|iPhone|iPod)/.test(window.navigator.platform) ||
      (/^Mac/.test(window.navigator.platform) &&
        window.navigator.maxTouchPoints > 1);
    if (IS_IOS) {
      const dismissLoadScreen = () => {
        // setTimeout(() => {
        gradient.classList.add("fade-out");
        // }, 1500)
        setTimeout(() => {
          gradient.style.display = "none";
          isVisible = true
        }, 200);
      };
      if (!isVisible) {
        setTimeout(() => {
          spinner.style.display = "none";
          document.querySelector(".btn").style.display = "block";
        }, 3000);
        start.addEventListener("click", () => {
          scene.hasLoaded
            ? dismissLoadScreen()
            : scene.addEventListener("loaded", dismissLoadScreen);
        });
      }
    } else {
      const dismissLoadScreen = () => {
        setTimeout(() => {
          gradient.classList.add("fade-out");
        }, 1500);
        setTimeout(() => {
          gradient.style.display = "none";
          isVisible = true
        }, 2000);
      };
      if (!isVisible) {
        scene.hasLoaded
          ? dismissLoadScreen()
          : scene.addEventListener("loaded", dismissLoadScreen);
      }
    }
}
