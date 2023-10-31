const user = "example";
function fn(a) {
    return a.toUpperCase();
}

function init() {
    function createComponent(text) {
        const h1 = document.createElement("h1");
        const body = document.querySelector("body");
        h1.textContent = text;
        body.append(h1);
    }
    createComponent(fn(user));
}
document.addEventListener("DOMContentLoaded", init);
