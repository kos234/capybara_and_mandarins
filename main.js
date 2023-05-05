let _8__px;
let _current_8_px;
let capy;
let isPaused = true;
let isWeatherPaused = false;
let backGround;
let menu;
let difficult = 0;
let bot;
let mandarines;

let isDebug = false;

class CapyPlayer {
    player;
    state = 0;
    parentField;
    position;
    offsetStep = 1;
    directionX = 1;
    directionY = 0;

    keys = [];

    constructor() {
        this.player = document.querySelector(".capybara");
        this.parentField = this.player.parentNode;
        this.reset();

        document.addEventListener('keydown', (event) => {
            if (!bot.isBot())
                this.keys[event.code] = true;
        });
        document.addEventListener('keyup', (event) => {
            if (!bot.isBot())
                delete this.keys[event.code];
        });

        this.createAnim();
    }

    reset() {
        this.position = 1920 / 2 / 8;
        this.offsetStep = 1;
        this.player.style.left = "calc(" + this.position + " * var(--8-px))";
    }

    getCarrete() {
        let rect = capy.player.getBoundingClientRect();
        return {
            top: rect.top + (this.directionY === 1 ? (_current_8_px * 3) : (_current_8_px * 22)),
            left: (this.directionX === 1 ? rect.left + (this.directionY === 1 ? (_current_8_px * 9) : (0)) : (rect.right - (this.directionY === 1 ? (_current_8_px * 20) : (_current_8_px * 11)))),
            right: _current_8_px * 11,
            bottom: _current_8_px * 6,
        };
    }

    createAnim() {
        setInterval(() => {
            if (isPaused)
                return;
            let isMove = false;
            let directChange = false;
            if (this.keys["KeyW"]) {
                this.directionY = 1;
                directChange = true;
            }
            if (this.keys["KeyA"]) {
                this.directionX = 1;
                this.player.style.transform = "translate(-50%, -50%) scale(1, 1)";
                isMove = true;
            }
            if (this.keys["KeyS"]) {
                this.directionY = 0;
                directChange = true;
            }
            if (this.keys["KeyD"]) {
                this.directionX = -1;
                this.player.style.transform = "translate(-50%, -50%) scale(-1, 1)";
                isMove = true;
            }

            if (!isMove && this.state !== 0) {
                this.player.src = "imgs/capy_walk_" + this.directionY + "_0.webp";
            }

            if (!isMove) {
                if (directChange) {
                    this.player.src = "imgs/capy_walk_" + this.directionY + "_0.webp";
                }
                return;
            }

            this.position -= this.directionX * this.offsetStep;
            if ((this.position < 105 && this.directionX === 1) || (this.position > 135 && this.directionX === -1)) {
                // let playerOffset = this.player.offsetWidth / 2;
                // if ((this.position < this.player.offsetWidth / 2 && this.directionX === 1) || (this.position > this.parentField.offsetWidth - playerOffset && this.directionX === -1)) {
                this.player.src = "imgs/capy_walk_" + this.directionY + "_0.webp";
                this.position = this.directionX === 1 ? 105 : 135;
                this.player.style.left = "calc(" + this.position + " * var(--8-px))";
                // this.position += this.directionX * this.offsetStep
                return;
            }


            this.state++;
            if (this.state > 3)
                this.state = 0;
            this.player.src = "imgs/capy_walk_" + this.directionY + "_" + this.state + ".webp";

            this.player.style.left = "calc(" + this.position + " * var(--8-px))";
            this.player.style.bottom = this.state % 2 !== 0 ? "calc(-25 * var(--8-px))" : "calc(-25 * var(--8-px))";
            // this.player.style.top = this.state % 2 !== 0 ? "calc(50% - 0.3191489361702128vh)" : "50%";
        }, 60);
    }
}

class Mandarines {
    mandarinLose = 0;
    mandarinWin = 0;
    random = 1;
    mandarinWrapper;
    time = 5;
    loseWrapper;
    mandarines = new Map();
    scorePage;

    last = {
        wall: -1,
        time: -1
    }

    hit_box_mad;
    hit_box_capy;

    constructor() {
        // let speedWater = this.animAir.offsetWidth / (20 * 1000)

        this.mandarinWrapper = document.querySelector(".mandarines_container");
        this.scorePage = document.querySelector(".score_page");

        this.hit_box_mad = document.querySelector(".hit_box_mad");
        this.loseWrapper = document.querySelector(".lose_wrapper");
        this.hit_box_capy = document.querySelector(".hit_box_capy");
        setInterval(() => {
            if (isPaused)
                return;
            if (this.mandarines.size < this.random) {
                let random = parseInt(Math.random() * 4, 10).toString();
                // let random = "2";
                // if(random < 2)
                //     random = 0;
                // else
                //     random = 2;

                let dat = new Date().getTime();
                //111

                if (this.last.wall !== -1) {
                    let otherTime = (111 / (capy.offsetStep * 60) * 1000) * 1.5;
                    if (this.last.time + otherTime > dat) {
                        return;
                    }
                }
                this.last.wall = random;
                this.last.time = dat;
                let mand = document.createElement("img");

                let index = (Math.random() * 1000).toString();

                mand.src = "imgs/mandarin.webp";
                mand.className = "mandarin";
                mand.setAttribute("id", index);
                mand.setAttribute("wall", random);
                mand.style.animation = "anim_wall_" + random + " " + this.time + "s linear forwards";
                this.mandarinWrapper.appendChild(mand);

                this.mandarines.set(index, mand);

                mand.addEventListener("animationend", () => {
                    let id = mand.getAttribute("id");
                    if (this.mandarines.has(id)) {
                        let elemRect = mand.getBoundingClientRect();
                        let time = (backGround.animWater.offsetWidth - elemRect.left) * 20 / backGround.animWater.offsetWidth;
                        this.addLose();
                        this.mandarines.delete(mand.getAttribute("id"));
                        mand.style.animation = "anim_wall_water_" + mand.getAttribute("wall") + " " + time + "s linear forwards";
                        mand.setAttribute("wall", "-1");
                    } else
                        mand.remove();
                    // mand.addEventListener("animationend", () => {
                    //     mand.remove();
                    // }, false);
                }, false);
            }
        }, 60);

        setInterval(() => {
            if (isPaused)
                return;
            let rectCapy = capy.getCarrete();
            this.mandarines.forEach(elem => {

                if (isDebug) {
                    this.hit_box_capy.style.top = rectCapy.top + "px";
                    this.hit_box_capy.style.left = rectCapy.left + "px";
                    this.hit_box_capy.style.width = rectCapy.right + "px";
                    this.hit_box_capy.style.height = rectCapy.bottom + "px";
                }

                let elemRect = elem.getBoundingClientRect();
                if (isDebug) {
                    this.hit_box_mad.style.top = (elemRect.top) + "px";
                    // this.hit_box_mad.style.left = elemRect.left + elemRect.height * 0.25 + "px";
                    this.hit_box_mad.style.left = elemRect.left + "px";
                    this.hit_box_mad.style.width = elemRect.width + "px";
                    this.hit_box_mad.style.height = elemRect.height + "px";
                }

                if ((Math.max(Math.abs(elemRect.bottom - rectCapy.top), Math.abs(rectCapy.top + rectCapy.bottom - elemRect.top)) <= elemRect.height + rectCapy.bottom) && (Math.max(Math.abs(elemRect.right - rectCapy.left), Math.abs(rectCapy.left + rectCapy.right - elemRect.left)) <= elemRect.width + rectCapy.right)) {
                    if (elem.getAttribute("wall") % 2 === capy.directionY % 2)
                        return;
                    this.addWin();
                    this.mandarines.delete(elem.getAttribute("id"));
                    elem.remove();
                }
            });
        }, 10);
    }

    addLose() {
        this.mandarinLose++;
        this.animBar();
        if (this.loseWrapper.children.length < this.mandarinLose) {
            this.gameOver();
        } else {
            this.loseWrapper.children[this.mandarinLose - 1].src = "imgs/mandarin_not.webp";
        }
    }

    animBar() {
        this.loseWrapper.style.removeProperty("animation");
        setTimeout(() => {
            this.loseWrapper.style.animation = "animBlink 1s linear backwards";
        }, 10);
    }

    addWin() {
        this.mandarinWin++;
        if (this.mandarinWin % 100 === 0) {
            this.mandarinLose = 0;
            for (let i = 0; i < this.loseWrapper.children.length; i++)
                this.loseWrapper.children[i].src = "imgs/mandarin.webp";
            this.animBar();
        }
        this.scorePage.innerText = "Счёт: " + this.mandarinWin;

        this.random = 1 + parseInt(this.mandarinWin / 15);
        if (difficult !== 2)
            this.random = Math.min(this.random, difficult === 0 ? 4 : 8);
        capy.offsetStep = 1 + this.mandarinWin / 15;
        this.time = 5 - this.mandarinWin / 15;
        if (difficult !== 2)
            this.time = Math.max(this.time, difficult === 0 ? 2 : 1);
    }

    gameOver() {
        onPause(true);
        capy.reset();
        this.mandarinWrapper.innerHTML = "";
        this.mandarines.clear();
        menu.gaveEnd(this.mandarinWin);

        this.mandarinLose = 0;
        this.mandarinWin = 0;
        for (let i = 0; i < this.loseWrapper.children.length; i++)
            this.loseWrapper.children[i].src = "imgs/mandarin.webp";
        this.scorePage.innerText = "Счёт: 0";
        this.random = 1;
        this.time = 5;
    }
}

class Bot {
    botInr;
    is = false;

    constructor() {

    }

    start() {
        this.is = true;
        this.botInr = setInterval(() => {
            let arr = mandarines.mandarinWrapper.children;
            let wall = -1;
            for (let i = 0; i < arr.length; i++) {
                wall = parseInt(arr[i].getAttribute("wall"));
                if (wall !== -1)
                    break;
            }
            // capy.keys[event.code] = true;

            // delete this.keys[event.co    de];
            if (wall === -1)
                return;

            capy.keys = [];
            switch (wall) {
                case 0:
                    capy.keys["KeyW"] = true;
                    capy.keys["KeyA"] = true;
                    break;
                case 1:
                    capy.keys["KeyS"] = true;
                    capy.keys["KeyA"] = true;
                    break;
                case 2:
                    capy.keys["KeyW"] = true;
                    capy.keys["KeyD"] = true;
                    break;
                case 3:
                    capy.keys["KeyS"] = true;
                    capy.keys["KeyD"] = true;
                    break;
            }

        }, 10);
    }

    isBot() {
        return this.is;
    }

    end() {
        if (bot.isBot()) {
            clearInterval(this.botInr);
            this.is = false;
        }
    }
}

class BackGround {
    state = -1;
    wallWater;
    water;
    offset = 0;
    animWater;
    animAir;

    dataOffset = [0, 1, -1];

    constructor() {
        this.wallWater = document.querySelectorAll(".wall_anim");
        this.water = document.querySelectorAll(".water");
        this.animWater = document.querySelector(".water_wrapper");
        this.animAir = document.querySelector(".air_wrapper");
        this.animBackground();
    }

    animBackground() {
        console.log("8px");
        console.log(_8__px)
        console.log(_current_8_px)

        let speedWater = this.animWater.offsetWidth / (20 * 1000)
        let timeWater = Math.ceil(_current_8_px / speedWater);
        setInterval(() => {
            if (isWeatherPaused)
                return;
            this.state++;
            if (this.state > 3)
                this.state = 0;
            this.wallWater.forEach(elem => {
                elem.src = "imgs/wall_anim_" + this.state + ".webp";
            });
        }, 100);

        setInterval(() => {
            if (isWeatherPaused)
                return;
            if (Math.random() <= 0.5) {
                let div = document.createElement("div");
                div.className = "water_anim";
                div.style.bottom = "calc(" + parseInt(Math.random() * 19, 10) + " * var(--8-px))";
                div.style.width = "calc(" + parseInt(Math.random() * 5, 10) + " * var(--8-px) + var(--8-px))";
                div.addEventListener("animationend", () => {
                    div.remove();
                }, false);
                this.animWater.appendChild(div);
            }
        }, timeWater);
        console.log(timeWater)
        let speedCloud = this.animAir.offsetWidth / (30 * 1000)
        let timeCloud = Math.ceil(_current_8_px / speedCloud);

        setInterval(() => {
            if (isWeatherPaused)
                return;
            let rand = parseInt((Math.random() * 3), 10);
            let local = this.dataOffset[rand];
            if (this.offset * 8 > this.animAir.offsetHeight / 2 && local > 0)
                local *= -1;
            this.offset += local;

            if (this.offset < 0)
                this.offset = 0;
            if (this.offset !== 0) {
                let div = document.createElement("div");
                div.className = "air_anim";
                div.style.height = "calc(" + this.offset + " * var(--8-px))";
                div.addEventListener("animationend", () => {
                    div.remove();
                }, false);
                this.animAir.appendChild(div);
            }
        }, timeCloud);
        console.log(timeCloud)
    }
}

class Menu {
    isReload = true;
    pauseButton;
    menu;
    subtitlePage;
    localScore;
    maxScore
    isOpen = false;


    //settings
    selectElemDifficult;
    selectionAboutDifficult;

    constructor() {
        difficult = localStorage.getItem("difficult");
        if (difficult == null)
            difficult = 0;
        else
            difficult = parseInt(difficult);

        this.pauseButton = document.querySelector(".pauseButton");
        this.isOpen = true;
        document.addEventListener('keydown', (event) => {
            if (event.code === "Escape" && !this.isOpen)
                onPause(!isPaused, true);
        });

        this.menu = document.querySelector(".game_start");
        this.subtitlePage = document.querySelector(".subtitle_page.max_score");
        this.localScore = document.querySelector(".subtitle_page.local_score");

        this.maxScore = localStorage.getItem("max_score");
        if (this.maxScore === null)
            this.maxScore = 0;

        this.subtitlePage.innerText = "Максимальный счёт: " + this.maxScore;

        this.pauseButton.onclick = () => {
            onPause(!isPaused);
        }

        this.menu.querySelector(".button_page.start").onclick = () => {
            this.startGame();
        };
        this.menu.querySelectorAll(".button_page.settings").forEach(elem => {
            elem.onclick = () => {
                        this.settings();
                    };
        });
        this.menu.querySelector(".button_page.bot").onclick = () => {
            this.startGame(true);
        };

        let tmp = document.body.querySelector(".switch_page.difficult");
        this.selectElemDifficult = tmp.querySelector(".selectElem");
        this.selectionAboutDifficult = tmp.querySelector(".selection_about");
        tmp.querySelectorAll(".selectAll_content").forEach(elem => {
            elem.onclick = () => {
                this.clickSelection(elem);
            }
        });

        this.initDif();
    }

    clickSelection(elem) {
        difficult = parseInt(elem.getAttribute("data-type"));

        this.initDif();

        localStorage.setItem("difficult", difficult);
    }

    initDif(){
        switch (difficult){
            case 0:
                this.selectElemDifficult.innerText = "Лёгкая";
                this.selectionAboutDifficult.innerHTML = "&#160;-&#160;не больше 4 мандарин на экране, скорость мандарин ограничена 2-мя секундами"
                break;
            case 1:
                this.selectElemDifficult.innerText = "Нормальная";
                this.selectionAboutDifficult.innerHTML = "&#160;-&#160;не больше 8 мандарин на экране, скорость мандарин ограничена 1-ой секундой"
                break;
            case 2:
                this.selectElemDifficult.innerText = "Сложная";
                this.selectionAboutDifficult.innerHTML = "&#160;-&#160;никаких ограничений, вы проиграете"
                break;
        }
    }

    settings() {
        let elem = this.menu.querySelector(".wrapper_start");
        if(elem.style.transform)
            elem.style.removeProperty("transform");
        else
            elem.style.transform = "translateY(-100vh)";
    }

    startGame(isBot = false) {
        this.pauseButton.style.opacity = "1";

        this.isOpen = false;
        this.menu.style.transform = "translateY(-100%)";
        onPause(false);
        if (this.isReload) {
            mandarines = new Mandarines();
        }
        this.isReload = false;
        if (isBot)
            bot.start();
    }

    gaveEnd(score) {
        this.isOpen = true;
        this.pauseButton.style.opacity = "0";
        if (!bot.isBot())
            this.maxScore = Math.max(this.maxScore, score);

        bot.end()

        localStorage.setItem("max_score", this.maxScore);

        this.menu.style.transform = "translateY(0%)";
        this.menu.querySelector(".title_page").innerText = "Игра окончена";
        this.localScore.style.removeProperty("display");
        console.log("Текущий счёт: " + score);
        this.localScore.innerText = "Текущий счёт: " + score;
        this.subtitlePage.innerText = "Максимальный счёт: " + this.maxScore;
    }
}

window.addEventListener("load", () => {
    gameInit();
});

document.addEventListener("visibilitychange", function () {
    if (document.hidden)
        onPause(true);
});
window.addEventListener("resize", function () {
    gameInit(false);
});

function onPause(paus = true, full = false) {
    document.querySelectorAll(".mandarin").forEach((elem) => {
        elem.style.animationPlayState = paus ? "paused" : "running";
    });
     isPaused = paus;
    if(full){
        isWeatherPaused = paus;
        document.querySelectorAll(".water_anim").forEach((elem) => {
                elem.style.animationPlayState = paus ? "paused" : "running";
            });
            document.querySelectorAll(".air_anim").forEach((elem) => {
                elem.style.animationPlayState = paus ? "paused" : "running";
            });
    }
    document.querySelector(".pauseButton").src = isPaused ? "imgs/play_arrow_black_24dp.svg" : "imgs/pause_black_24dp.svg";
}

//
// function resize(){
//     _8__px = parseFloat(window.getComputedStyle(document.body).getPropertyValue('--8-px'));
//     _current_8_px = document.documentElement.clientWidth * _8__px / 100;
//     airInit();
//     console.log("resize");
// }

function gameInit(isStart = true) {
    _8__px = parseFloat(window.getComputedStyle(document.body).getPropertyValue('--8-px'));
    _current_8_px = document.documentElement.clientWidth * _8__px / 100;
    let bottomWrapper = document.querySelector(".bottom_wrapper");

    let stoneWrapper = bottomWrapper.querySelector(".stone_wrapper");

    if (isStart) {
        document.querySelectorAll(".floor_wrapper").forEach(elem => {
            let floor = elem.querySelector(".floor");
            while (elem.offsetWidth < document.documentElement.clientWidth || elem.children.length % 2 === 0) {
                elem.appendChild(floor.cloneNode(false));
                console.log("531");
            }
        });

        document.querySelectorAll(".node_wrapper").forEach(elem => {
            let node = elem.querySelector(".node");
            while (elem.offsetWidth < document.documentElement.clientWidth || elem.children.length % 2 === 0) {
                elem.appendChild(node.cloneNode(false));
                console.log("539");
            }
        });

        let stone = stoneWrapper.querySelector(".stone");
        while (stoneWrapper.offsetWidth < document.documentElement.clientWidth || stoneWrapper.children.length % 2 === 0) {
            stoneWrapper.appendChild(stone.cloneNode(false));
            console.log("547");
        }
    }

    let rect = bottomWrapper.getBoundingClientRect();
    let offset = 0;
    while (rect.top + bottomWrapper.offsetHeight + (isStart ? 0 : offset) < document.documentElement.clientHeight) {
        bottomWrapper.appendChild(stoneWrapper.cloneNode(true));
        offset += stoneWrapper.offsetHeight;
        console.log(stoneWrapper.offsetHeight);
        console.log("552");
        console.log(document.documentElement.clientHeight);
        console.log(rect.top + bottomWrapper.offsetHeight + offset);
    }
    if (isStart) {
        let topWrapper = document.querySelector(".top_wrapper");

        let waterWrapper = topWrapper.querySelector(".water_wrapper");
        let water = waterWrapper.querySelector(".water");
        while (waterWrapper.offsetWidth < document.documentElement.clientWidth) {
            waterWrapper.appendChild(water.cloneNode(false));
            console.log("562");
        }
    }
    airInit();
    if (isStart) {
        bot = new Bot();
        backGround = new BackGround();
        menu = new Menu();
        capy = new CapyPlayer();
    }
}

function airInit() {
    let airWrapper = document.querySelector(".air_wrapper");
    airWrapper.querySelectorAll(".air").forEach(elem => elem.remove());
    let count = Math.ceil(airWrapper.offsetHeight / _current_8_px);

    let rStart = 255;
    let gStart = 255;
    let bStart = 255;

    let rEnd = 122;
    let gEnd = 218;
    let bEnd = 252;

    let rOffset = (rStart - rEnd) / (count - 1);
    let gOffset = (gStart - gEnd) / (count - 1);
    let bOffset = (bStart - bEnd) / (count - 1);

    for (let i = 0; i < count; i++) {
        rEnd += rOffset;
        gEnd += gOffset;
        bEnd += bOffset;

        let airWaW = document.createElement("div");
        airWaW.className = "air";
        airWaW.style.background = "rgba(" + rEnd + " , " + gEnd + ", " + bEnd + ")";
        airWrapper.appendChild(airWaW);
    }
}