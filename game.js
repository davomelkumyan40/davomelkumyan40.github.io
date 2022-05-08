(function () {
    class Pipe {
        constructor(elem) {
            this.pipeY = 85;
            this.elem = elem;
        }

        randomize() {
            this.elem.style.bottom = `${this.pipeY - rand(-85, 85)}px`;
        }

        move() {
            this.elem.classList.remove("pipePause");
        }

        pipeReset() {
            pipeRand();
            this.elem.classList.remove("pipeMoveing");
            void this.elem.offsetWidth; // resets animation
            this.elem.classList.add("pipeMoveing");
        }

    }


    class Bird {
        constructor() {
            this.y = 0;
            this.angle = 0;
            this.inertia = 0;
            this.fallRatio = -9;
            this.fallDistance = 13;
            this.isFalling = false;
            this.speed = 2;
        }

        bind(screenObj) {
            this.y = screenObj.height * 48 / 100;
        }

        calculatePhsycs() {
            if (this.isFalling)
                this.inertia += 0.5;
            else
                this.inertia = 0;
        }

        fallDown() {
            let totalFallDistance = (this.fallDistance + this.inertia);
            if (totalFallDistance)
                this.y -= totalFallDistance / 2;
        }

        flyUp() {
            this.y += 110;
        }

        startFalling() {
            this.isFalling = true;
            this.fallDistance = 12;
        }

        stopFalling() {
            this.fallDistance = 0;
            this.isFalling = false;
        }

        isDead() {
            if (this.y <= groundHeight) {
                this.y = groundHeight;
                this.y -= this.inertia + this.fallRatio;
                this.fallRatio = 0;
                if (this.y <= groundHeight - 20) {
                    headstone.classList.add("headstoneMoveUp");
                }
                return true;
            }
            return false;
        }
    }


    const birdElem = document.querySelector("#bird");
    const bgImages = [...document.querySelectorAll(".bgImg")];
    const grounds = [...document.querySelectorAll(".ground")];
    const headstone = document.querySelector("#headstone");
    const debugOverlay = document.querySelector(".dContainer");
    const pipeList = [...document.querySelectorAll(".pair")].map((p) => {
        return new Pipe(p);
    });
    const debugWindow = document.querySelector("#debugWindow");
    const groundHeight = 170;
    const screen = { height: 720, width: 480 };
    const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;
    let debugProps = [];
    let gameIsOver = false;
    let gameStarted = false;
    let threadId = -1;
    let keyPressed = undefined;
    let score = 0;
    let coins = 0;
    let isDebugMode = true;

    pipeList.forEach((p, i) => {
        p.elem.onanimationstart = () => p.randomize();
    });


    pipeList.forEach((p, i) => {

        p.onanimationiteration = () => p.randomize();
        p.onanimationend = () => p.pipeReset();
        setTimeout(() => p.move(p), (i + 1) * 1000);
    });


    const bird = new Bird();
    bird.bind(screen);

    function stopGame() {
        clearInterval(threadId);
        gameStarted = false;
        bgImages.forEach((e) => e.classList.add("bgPauseAnim"));
        grounds.forEach((e) => e.classList.add("groundPauseAnim"));
        birdElem.classList.remove("floatBird");
        birdElem.style.backgroundImage = "url('./Assets/bird_noanim.png')";
    }

    function resetGame() {
        headstone.classList.remove("headstoneMoveUp");
        // birdElem.classList.remove("upAngle");
        birdElem.classList.remove("downAngle");
        birdElem.style.backgroundImage = "url('./Assets/bird.gif')";
        bird = new Bird();
        bird.bind(screen);
        gameIsOver = false;
        bgImages.forEach((e) => {
            e.classList.remove("bgPauseAnim");
        });
        grounds.forEach((e) => {
            e.classList.remove("groundPauseAnim");
        });
        birdElem.classList.add("floatBird");
    }

    function debugModeToggle() {
        isDebugMode = !isDebugMode;
        birdElem.classList.toggle("debugMode");
        debugWindow.classList.toggle("debugOverlay");
        pipePairs.forEach((e, i, a) => {
            e.childNodes.forEach((e, i, a) => e.classList && e.classList.toggle("debugMode"));
        });
    }

    //TODO test remove in end
    document.querySelector(".window").addEventListener("click", () => {
        stopGame();
        resetGame();
        render();
    });

    function render() {
        birdElem.style.bottom = `${bird.y}px`;
        if (isDebugMode) {
            debugOverlay.innerHTML = "";
            for (let i = 0; i < debugProps.length; i++) {
                let p = document.createElement("p");
                let tn = document.createTextNode(debugProps[i]);
                p.appendChild(tn);
                debugOverlay.appendChild(p);
            }
        }
    }

    setInterval(() => {
        if (isDebugMode) {
            debugProps = [
                `Y: ${bird.y.toFixed(3)}`,
                `Pipe Pair Y: ${0}`,
                `Bird height: ${(bird.y - groundHeight).toFixed(3)}`,
                `Inertion value: ${bird.inertia}`,
                `Ground heigh: ${groundHeight}`,
                `Height: ${screen.height}px`,
                `Width: ${screen.width}px`,
                `Key pressed: ${keyPressed}`,
                `Game is over: ${gameIsOver}`,
                `Speed value : ${bird.speed}`,
                `Score: ${score}`, /*TODO*/
                `Coins: ${coins}` /*TODO*/
            ];
        }
        render();
    }, 1);

    //TODO upNose finish
    window.addEventListener("keydown", function (e) {
        keyPressed = e.key;
        keyPressed = keyPressed.replace(" ", "Space");
        switch (e.key.toLowerCase()) {
            case ' ':
                if (!gameIsOver) {
                    bird.stopFalling();
                    birdElem.style.transition = "all 0.25s";
                    // birdElem.classList.add("upNose");
                    birdElem.classList.add("upAngle");
                    birdElem.classList.remove("downAngle");
                    bird.flyUp();
                    if (!gameStarted) {
                        birdElem.classList.remove("floatBird");
                        threadId = setInterval(() => {
                            if (!gameIsOver) {
                                bird.calculatePhsycs();
                                bird.fallDown();
                                bird.fallDown();
                                gameIsOver = bird.isDead();
                            } else stopGame();
                        }, 20);
                        gameStarted = true;
                    }
                }
                break;
            case "f8":
                debugModeToggle();
                break;
        }
    });

    birdElem.addEventListener("transitionend", function () {
        this.style.transition = "all 0.1s";
        if (gameStarted) {
            bird.startFalling();
            // birdElem.classList.remove("upNose");
            birdElem.classList.remove("upAngle");
            birdElem.classList.add("downAngle");
        }
    });

})();