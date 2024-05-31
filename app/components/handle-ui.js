const handleScreenUIComponent = {
  init() {
    const closeBtn = document.getElementById("closeBtn");
    const tabPopup = document.getElementById("tab-popup");
    // console.log(tabPopup);
    closeBtn.addEventListener("click", () => {
      // console.log("clicked close");
      tabPopup.classList.add('fade-out')
      tabPopup.classList.remove('fade-in')
      setTimeout(() => {
        tabPopup.style.display = "none";
      }, 400);
    });
  },
};
export { handleScreenUIComponent };
