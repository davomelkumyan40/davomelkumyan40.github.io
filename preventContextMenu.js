[...document.querySelectorAll(".container, .background, #bird")].forEach((e, i, a) =>{
    e.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
});