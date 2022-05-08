(function () {

    [...document.querySelectorAll(".container, .background, #bird")].forEach((e, i, a) => {
        e.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });


    class Pipe {
        constructor(elem) {
            this.pipeY = 85;
            this.elem = elem;
            this.id = -1;
        }

        randomize() {
            this.elem.style.bottom = `${this.pipeY - rand(-85, 85)}px`;
        }

        move() {
            this.elem.classList.remove("pipePause");
        }

        pipeReset() {
            this.randomize();
            this.elem.classList.remove("pipeMoveing");
            void this.elem.offsetWidth; // resets animation
            this.elem.classList.add("pipeMoveing");
        }

    }
    const birdElem = document.querySelector("#bird");
    const bgImages = [...document.querySelectorAll(".bgImg")];
    const grounds = [...document.querySelectorAll(".ground")];
    const headstone = document.querySelector("#headstone");
    const pipeList = [...document.querySelectorAll(".pair")].map((p) => {
        return new Pipe(p);
    });
    const debugWindow = document.querySelector("#debugWindow");
    const groundHeight = 170;
    const screen = { height: 720, width: 480 };
    const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;
    let gameIsOver = false;
    let gameStarted = false;
    let threadId = -1;
    let score = 0;
    let coins = 0;
    let isDebugMode = true;

    function Bird() {
        this.y = 0;
        this.angle = 0;
        this.inertia = 0;
        this.fallRatio = -9;
        this.fallDistance = 13;
        this.isFalling = false;
        this.speed = 2;

        this.bind = (screenObj) => {
            this.y = screenObj.height * 48 / 100;
        }

        this.calculatePhsycs = () => {
            if (this.isFalling)
                this.inertia += 0.5;
            else
                this.inertia = 0;
        }

        this.fallDown = () => {
            let totalFallDistance = (this.fallDistance + this.inertia);
            if (totalFallDistance)
                this.y -= totalFallDistance;
        }

        this.flyUp = () => {
            this.y += 110;
        }

        this.startFalling = () => {
            this.isFalling = true;
            this.fallDistance = 12;
        }

        this.stopFalling = () => {
            this.fallDistance = 0;
            this.isFalling = false;
        }

        this.isDead = () => {
            if (this.y <= groundHeight) {
                this.y = groundHeight;
                this.y -= this.inertia + this.fallRatio;
                this.fallRatio = 0;
                if (this.y <= groundHeight - 20) {
                    headstone.classList.add("headstoneMoveUp"); // TODO
                }
                return true;
            }
            return false;
        }
    }
    const bird = new Bird();
    bird.bind(screen);


    pipeList.forEach((p, i) => {
        p.elem.onanimationstart = () => p.randomize();
        p.elem.onanimationiteration = () => p.randomize();
        p.elem.onanimationend = () => p.pipeReset();
        p.id = setTimeout(() => p.move(), (i + 1) * 1000);
    });

    function stopGame() {
        clearInterval(threadId);
        gameStarted = false;
        bgImages.forEach((e) => e.classList.add("bgPauseAnim"));
        grounds.forEach((e) => e.classList.add("groundPauseAnim"));
        pipeList.forEach((p) => p.elem.classList.add("pipePause"))
        birdElem.classList.remove("floatBird");
        birdElem.style.backgroundImage = "url('./Assets/bird_noanim.png')";
    }

    function resetGame() {
        headstone.classList.remove("headstoneMoveUp");
        birdElem.classList.remove("upAngle");
        birdElem.classList.remove("downAngle");
        birdElem.style.backgroundImage = "url('./Assets/bird.gif')";
        bird.bind(screen);
        gameIsOver = false;
        bgImages.forEach((e) => {
            e.classList.remove("bgPauseAnim");
        });
        grounds.forEach((e) => {
            e.classList.remove("groundPauseAnim");
        });
        pipeList.forEach((p, i) => {
            p.pipeReset();
            clearInterval(p.id);
            setTimeout(() => p.move(), (i + 1) * 1000);
        });
        birdElem.classList.add("floatBird");
    }

    function render() {
        birdElem.style.bottom = `${bird.y}px`;
    }

    setInterval(() => {
        render();
    }, 0);

    function gameHandler(e) {
        if (!gameIsOver) {
            bird.stopFalling();
            birdElem.style.transition = "all 0.25s";
            birdElem.classList.remove("downAngle");
            birdElem.offsetWidth;
            birdElem.classList.add("upAngle");
            bird.flyUp();
            if (!gameStarted) {
                birdElem.classList.remove("floatBird");
                birdElem.offsetWidth;
                threadId = setInterval(() => {
                    if (!gameIsOver) {
                        bird.calculatePhsycs();
                        bird.fallDown();
                        gameIsOver = bird.isDead();
                    } else stopGame();
                }, 20);
                gameStarted = true;
            }
        } else {
            stopGame();
            resetGame();
            render();
        }
    }

    window.addEventListener("touchstart", gameHandler);

    birdElem.addEventListener("transitionend", function () {
        this.style.transition = "all 0.1s";
        if (gameStarted) {
            bird.startFalling();
            birdElem.classList.remove("upAngle");
            birdElem.offsetWidth;
            birdElem.classList.add("downAngle");
        }
    });

})();