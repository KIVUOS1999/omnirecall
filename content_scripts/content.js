navigate_to_page = () => {
    const button = document.createElement("button");
    button.id = "page-saver-button";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.zIndex = 10000;
    button.style.padding = "10px 12px";
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "30px";
    button.style.cursor = "pointer";

    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("icons/icon16.png");
    img.alt = "Recall";

    button.appendChild(img);

    document.body.appendChild(button);

    button.addEventListener("click", () => {
        button.addEventListener("click", () => {
            console.log(`recall button clicked ${window.location.hostname}`)
            chrome.runtime.sendMessage({ type: "navigate_to_saved_page", hostname: window.location.hostname });
        });
    });
}

navigate_to_page()