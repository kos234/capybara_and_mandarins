let _8__px;
let _current_8_px;
let capy;
let isPaused = true;
let isMusicPause = false;
let backGround;
let menu;
let difficult = 0;
let bot;
let mandarines;


let isMusic = true;
// let ysdk;

// let isNotViewRating = true;
let audioContext = new AudioContext();

let backgroundAudioBuffer;
let pickupAudioBuffer;
let loseAudioBuffer = []
let walkAudioBuffer = [];

let isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

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

        let gameButtons;
        if (isMobile) {
            gameButtons = document.body.querySelector(".game_buttons");
            gameButtons.style.removeProperty("display");

            gameButtons.querySelectorAll(".game_button").forEach(elem => {
                elem.addEventListener("touchstart", (e) => {
                    e.target.children[0].src = "imgs/button_pressed.webp";
                    e.target.getAttribute("data-key").split(";").forEach(s => {
                        if (!bot.isBot())
                            this.keys[s] = true;
                    });
                });
                elem.addEventListener("touchend", (e) => {
                    e.target.children[0].src = "imgs/button.webp";
                    e.target.getAttribute("data-key").split(";").forEach(s => {
                        if (!bot.isBot())
                            delete this.keys[s];
                    });
                });
            });
        }

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
        this.directionY = 0;
        this.position = 1920 / 2 / 8;
        this.offsetStep = 1;
        this.player.style.left = "calc(" + this.position + " * var(--8-px))";
        this.player.src = "imgs/capy_walk_0_0.webp";
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
            this.player.src = "imgs/capy_walk_" + this.directionY + "_0.webp";
            this.position = this.directionX === 1 ? 105 : 135;
            this.player.style.left = "calc(" + this.position + " * var(--8-px))";
            return;
        }


        this.state++;
        if (this.state > 3)
            this.state = 0;
        this.player.src = "imgs/capy_walk_" + this.directionY + "_" + this.state + ".webp";
        this.player.alt = "imgs/capy_walk_" + this.directionY + "_" + this.state + ".webp";

        if (isMusic) {
            playAudio(walkAudioBuffer[parseInt(Math.random() * 6)], 0.25);
        }

        this.player.style.left = "calc(" + this.position + " * var(--8-px))";
        this.player.style.bottom = this.state % 2 !== 0 ? "calc(-25 * var(--8-px))" : "calc(-25 * var(--8-px))";
    }
}

class Mandarines {
    mandarinLose = 0;
    mandarinWin = 0;
    random = 1;
    mandarinWrapper;
    time = 5;
    loseWrapper;
    scorePage;
    count = 0;

    last = {
        wall: -1,
        time: -1
    }

    hit_box_mad;
    hit_box_capy;

    constructor() {

        this.mandarinWrapper = document.querySelector(".mandarines_container");
        this.scorePage = document.querySelector(".score_page");

        this.hit_box_mad = document.querySelector(".hit_box_mad");
        this.loseWrapper = document.querySelector(".lose_wrapper");
        this.hit_box_capy = document.querySelector(".hit_box_capy");
    }

    hitBoxMandarineCycle() {
        let rectCapy = capy.getCarrete();

        let arr = this.mandarinWrapper.children;
        let mandarine = null;
        for (let i = 0; i < arr.length; i++) {
            if (parseInt(arr[i].getAttribute("wall")) !== -1) {
                mandarine = arr[i];
                break;
            }
        }
        if (mandarine == null)
            return;

        let elemRect = mandarine.getBoundingClientRect();

        if ((Math.max(Math.abs(elemRect.bottom - rectCapy.top), Math.abs(rectCapy.top + rectCapy.bottom - elemRect.top)) <= elemRect.height + rectCapy.bottom) && (Math.max(Math.abs(elemRect.right - rectCapy.left), Math.abs(rectCapy.left + rectCapy.right - elemRect.left)) <= elemRect.width + rectCapy.right)) {
            if (mandarine.getAttribute("wall") % 2 === capy.directionY % 2)
                return;
            this.addWin();
            mandarine.remove();
            this.count--;
        }
    }

    spawnMandarineCycle() {
        if (isPaused)
            return;
        if (this.count < this.random) {
            let random = parseInt(Math.random() * 4, 10).toString();

            let dat = new Date().getTime();

            if (this.last.wall !== -1) {
                let otherTime = (111 / (capy.offsetStep * 60) * 1000) * 1.5;
                if (this.last.time + otherTime > dat) {
                    return;
                }
            }
            this.last.wall = random;
            this.last.time = dat;
            let mand = document.createElement("img");

            mand.src = "imgs/mandarin.webp";
            mand.className = "mandarin";
            mand.setAttribute("wall", random);
            mand.style.animation = "anim_wall_" + random + " " + this.time + "s linear forwards";
            this.mandarinWrapper.appendChild(mand);
            this.count++;
            mand.addEventListener("animationend", () => {
                let id = mand.getAttribute("wall");
                if (id !== "-1") {
                    this.count--;
                    let elemRect = mand.getBoundingClientRect();
                    let time = (backGround.animWater.offsetWidth - elemRect.left) * 20 / backGround.animWater.offsetWidth;
                    this.addLose();
                    mand.style.animation = "anim_wall_water_" + mand.getAttribute("wall") + " " + time + "s linear forwards";
                    if (isPaused) {
                        mand.style.animationPlayState = "paused";
                    }
                    mand.setAttribute("wall", "-1");
                } else
                    mand.remove();
            }, false);
        }
    }

    addLose() {
        this.mandarinLose++;
        if (isMusic) {
            if (this.mandarinLose < 3) {
                playAudio(loseAudioBuffer[0], 1);
            } else if (this.mandarinLose < 5) {
                playAudio(loseAudioBuffer[1], 1);
            } else if (this.mandarinLose < 6) {
                playAudio(loseAudioBuffer[2], 1);
            } else {
                playAudio(loseAudioBuffer[3], 1);
            }
        }

        this.animBar();
        if (this.loseWrapper.children.length < this.mandarinLose) {
            menu.saveGameOver();
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
        if (isMusic) {
            playAudio(pickupAudioBuffer, 0.2);
        }
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
        capy.offsetStep = Math.min((difficult === 0) ? 5 : (difficult === 1 ? 8 : 20), 1 + this.mandarinWin / 30);
        this.time = 5 - this.mandarinWin / 30;
        let minValue = 2;
        if (difficult >= 1)
            minValue = 1;
        this.time = Math.max(this.time, minValue);
    }

    gameOver() {
        onPause(true);
        capy.reset();
        menu.gaveEnd(this.mandarinWin);

        this.mandarinWin = 0;

        this.gameClear();
        this.scorePage.innerText = "Счёт: 0";
        this.random = 1;
        this.time = 5;
    }

    gameClear() {
        this.mandarinWrapper.innerHTML = "";
        this.mandarinLose = 0;
        for (let i = 0; i < this.loseWrapper.children.length; i++)
            this.loseWrapper.children[i].src = "imgs/mandarin.webp";
    }
}

class Bot {
    is = false;

    constructor() {

    }

    start() {
        this.is = true;
    }

    botII() {
        let arr = mandarines.mandarinWrapper.children;
        let wall = -1;
        for (let i = 0; i < arr.length; i++) {
            wall = parseInt(arr[i].getAttribute("wall"));
            if (wall !== -1)
                break;
        }
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
    }

    isBot() {
        return this.is;
    }

    end() {
        if (bot.isBot()) {
            this.is = false;
            capy.keys = [];
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
        this.animWater = document.querySelector(".water_wrapper .air_animation_wrapper");
        this.animAir = document.querySelector(".air_wrapper .air_animation_wrapper");

        for (let i = this.animAir.children.length - 1; i >= 0; i--)
            this.animWeatherMethod(this.animAir.children[i]);

        this.animAir.style.animation = "animWaterAndWeather " + timeCloud + "ms linear forwards";

        this.animAir.addEventListener("animationend", () => {
            this.animWeatherMethodRestart();
        }, false);

        for (let i = this.animWater.children.length - 1; i >= 0; i--)
            this.animWaterMethod(this.animWater.children[i]);

        this.animWater.style.animation = "animWaterAndWeather " + timeWater + "ms linear forwards";
        this.animWater.addEventListener("animationend", () => {
            this.animWaterMethodRestart();
        }, false);
    }

    animWeatherMethodRestart() {
        this.animAir.children[1].innerHTML = "";
        this.animWeatherMethod(this.animAir.children[1]);
        this.animAir.insertBefore(this.animAir.children[1], this.animAir.children[0]);

        this.animAir.style.removeProperty("animation");
        setTimeout(() => {
            this.animAir.style.animation = "animWaterAndWeather " + timeCloud + "ms linear forwards";
        }, 10);
    }

    animWaterMethodRestart() {
        this.animWater.children[1].innerHTML = "";
        this.animWaterMethod(this.animWater.children[1]);//animWaterMethod
        this.animWater.insertBefore(this.animWater.children[1], this.animWater.children[0]);

        this.animWater.style.removeProperty("animation");
        setTimeout(() => {
            this.animWater.style.animation = "animWaterAndWeather " + timeWater + "ms linear forwards";
        }, 10);
    }

    animWeatherMethod(parent) {
        for (let i = 0; i < 120; i++) {
            let rand = parseInt((Math.random() * 3), 10);
            let local = this.dataOffset[rand];
            if (this.offset * 8 > this.animAir.offsetHeight / 2 && local > 0)
                local *= -1;
            this.offset += local;

            if (this.offset < 0)
                this.offset = 0;
            let div = document.createElement("div");
            div.className = "air_anim";
            if (this.offset !== 0)
                div.style.height = "calc(" + this.offset + " * var(--8-px))";
            else
                div.style.background = "transparent";
            div.addEventListener("animationend", () => {
                div.remove();
            }, false);
            parent.appendChild(div);
        }
    }

    animWaterMethod(parent) {
        let offsetWrapper = 0;
        for (let i = 0; offsetWrapper < 240; i++) {
            let div = document.createElement("div");
            div.className = "water_anim";
            div.style.marginBottom = "calc(" + parseInt(Math.random() * 19, 10) + " * var(--8-px))";
            let wew = parseInt(Math.random() * 5 + 1, 10);
            offsetWrapper += wew;
            div.style.width = "calc(" + wew + " * var(--8-px) + var(--8-px))";
            div.addEventListener("animationend", () => {
                div.remove();
            }, false);
            parent.appendChild(div);
        }
    }

    animBackground() {
        if (isPaused && (mandarines))
            return;
        this.state++;
        if (this.state > 3)
            this.state = 0;
        this.wallWater.forEach(elem => {
            elem.src = "imgs/wall_anim_" + this.state + ".webp";
        });
    }
}

class Menu {
    // isReload = true;
    pauseButton;
    menu;
    subtitlePage;
    localScore;
    maxScore
    isOpen = true;
    // backgroundAudio;// = new Audio('music/background.aac');

    buttonNewLiveAccept;
    buttonNewLiveCancel;
    startWrapper
    newLiveWrapper;

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
            if (event.code === "Escape")
                onPause(!isPaused, true);
        });

        this.menu = document.querySelector(".game_start");
        this.startWrapper = this.menu.querySelector(".wrapper_start");
        this.newLiveWrapper = this.startWrapper.querySelector(".new_live_wrapper");
        this.subtitlePage = document.querySelector(".start_dialog .subtitle_page.max_score");
        this.buttonNewLiveAccept = document.querySelector(".new_live_dialog .button_page.start");
        this.buttonNewLiveCancel = document.querySelector(".new_live_dialog .button_page.setting");
        this.localScore = document.querySelector(".subtitle_page.local_score");

        this.maxScore = localStorage.getItem("max_score");
        if (this.maxScore === null)
            this.maxScore = 0;

        this.subtitlePage.innerText = "Максимальный счёт: " + this.maxScore;

        this.pauseButton.onclick = () => {
            onPause(!isPaused, true);
        }

        this.menu.querySelector(".start_dialog .button_page.start").onclick = () => {
            this.startGame();
        };
        this.menu.querySelector(".start_dialog .button_page.restart").onclick = () => {
            mandarines.gameOver(mandarines.mandarinWin);
        };
        this.menu.querySelectorAll(".button_page.settings").forEach(elem => {
            elem.onclick = () => {
                this.settings();
            };
        });
        this.menu.querySelector(".button_page.bot").onclick = () => {
            this.startGame(!bot.isBot());
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

        this.menu.querySelectorAll(".switch_button").forEach(elem => {
            let id = elem.getAttribute("data-id");
            let value = localStorage.getItem("settings_" + id);
            if (value == null) {
                switch (id) {
                    case "0":
                        value = "1";
                        break;
                    case '1':
                        value = "0";
                        break;
                }
            }
            let isActive = !(/active/.test(elem.className));
            if (isActive === (value === "1"))
                this.switchClick(elem);

            elem.onclick = () => {
                this.switchClick(elem);
            }
        });
    }

    clickSelection(elem) {
        difficult = parseInt(elem.getAttribute("data-type"));

        this.initDif();

        localStorage.setItem("difficult", difficult);
    }

    initDif() {
        switch (difficult) {
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

    switchClick(elem) {
        let isActive = !(/active/.test(elem.className));
        elem.className = elem.className.replace(/\s+(active|disable)/, "") + " " + (isActive ? "active" : "disable");
        let id = elem.getAttribute("data-id");

        localStorage.setItem("settings_" + id, isActive ? "1" : "0");
        switch (id) {
            case "0":
                isMusic = isActive;
                console.log("isMusic")
                if (!isMusic) {
                    audioContext.suspend();
                }
                break;
        }
    }

    isSettings = false;

    settings() {
        if (this.isSettings)
            this.startWrapper.style.transform = "translateY(-100vh)";
        else
            this.startWrapper.style.transform = "translateY(-200vh)";

        this.isSettings = !this.isSettings;
    }

    lastPlay = 0;

    startGame(isBot = false) {
        if (isMusic) {
            this.playBackground();
        }

        this.pauseButton.style.opacity = "1";
        this.isOpen = false;
        this.menu.style.transform = "translateY(-100%)";
        onPause(false, true);
        if (isBot)
            bot.start();
        else if (mandarines)
            bot.end()

        if (!mandarines) {
            mandarines = new Mandarines();
        }
    }

    playBackground() {
        if (!isMusic)
            return;
        if (isMusicPause)
            return;
        if (!backgroundAudioBuffer) {
            return;
        }
        if (!mandarines)
            return;
        let localTime = new Date().getTime();
        if (this.lastPlay === 0 || (this.lastPlay + backgroundAudioBuffer.duration * 0.99 * 1000) <= localTime) {
            this.lastPlay = localTime;
            playAudio(backgroundAudioBuffer, 0.2);
        }
    }

    saveGameOver() {
        onPause(true);
        this.isOpen = true;
        this.pauseButton.style.opacity = "0";
        this.startWrapper.style.transform = "translateY(0)";
        bot.end();

        this.startWrapper.querySelector(".new_live_wrapper").innerHTML = `<img src="imgs/mandarin.webp" alt="mandarin_lose" class="mandarin_lose">
                    <img src="imgs/mandarin.webp" alt="mandarin_lose" class="mandarin_lose">
                    <img src="imgs/mandarin.webp" alt="mandarin_lose" class="mandarin_lose">
                    <img src="imgs/mandarin.webp" alt="mandarin_lose" class="mandarin_lose">
                    <img src="imgs/mandarin.webp" alt="mandarin_lose" class="mandarin_lose">
                    <img src="imgs/mandarin.webp" alt="mandarin_lose" class="mandarin_lose">`;

        this.buttonNewLiveAccept.onclick = () => {
            onPause(true, true);
            // ysdk.adv.showRewardedVideo({
            //     callbacks: {
            //         onOpen: () => {
            //
            //         },
            //         onRewarded: () => {
            //
            //         },
            //         onClose: () => {
                        this.newLiveActive();
                    // },
                    // onError: (e) => {
                    //     console.log('Error while open video ad:', e);
                    // }
                // }
            // })
        }
        this.buttonNewLiveCancel.onclick = () => {
            this.startWrapper.style.transform = "translateY(-100vh)";
            mandarines.gameOver();
        }

        this.menu.style.transform = "translateY(0%)";
        this.localScore.style.removeProperty("display");
    }

    newLiveActive() {
        setTimeout(() => {
            if (this.newLiveWrapper.children.length === 1) {
                mandarines.gameClear();
                this.pauseButton.style.opacity = "1";
                this.startWrapper.style.transform = "translateY(-100vh)";
                this.isOpen = false;
                this.menu.style.transform = "translateY(-100%)";
                onPause(false);
            } else {
                this.newLiveWrapper.children[this.newLiveWrapper.children.length - 1].remove();
                this.newLiveActive();
            }
        }, 500);
    }

    openPause() {
        this.pauseButton.style.opacity = "0";

        this.menu.style.transform = "translateY(0%)";
        this.menu.querySelector(".start_dialog .title_page").innerText = "Пауза";
        this.menu.querySelector(".start_dialog .button_page.start").innerText = "Продолжить";
        this.menu.querySelector(".start_dialog .button_page.bot").innerText = !bot.isBot() ? "Включить бота" : "Выключить бота";
        this.localScore.style.removeProperty("display");
        this.menu.querySelector(".start_dialog .button_page.restart").style.removeProperty("display");
        this.localScore.innerText = "Текущий счёт: " + mandarines.mandarinWin;
        this.subtitlePage.innerText = "Максимальный счёт: " + this.maxScore;
    }

    closePause() {
        this.pauseButton.style.opacity = "1";

        this.menu.style.transform = "translateY(-100%)";
    }

    gaveEnd(score) {
        this.menu.querySelector(".start_dialog .button_page.restart").style.display = "none";
        this.menu.querySelector(".start_dialog .button_page.start").innerText = "Играть";
        this.isOpen = true;
        onPause(false, true);
        this.pauseButton.style.opacity = "0";
        if (!bot.isBot()) {
            this.maxScore = Math.max(this.maxScore, score);
        }

        bot.end();

        // if (isNotViewRating) {
        //     ysdk.feedback.canReview()
        //         .then(({value, reason}) => {
        //             if (value) {
        //                 ysdk.feedback.requestReview()
        //             }
        //         })
        // }
        //
        // ysdk.isAvailableMethod('leaderboards.getLeaderboardPlayerEntry').then(value => {
        //     if (value) {
        //         ysdk.getLeaderboards()
        //             .then(lb => {
        //                 lb.setLeaderboardScore('allscore', this.maxScore);
        //             });
        //     }
        // });
        // audioContext.suspend();
        //
        // ysdk.adv.showFullscreenAdv({
        //     callbacks: {
        //         onClose: function (wasShown) {
        //             audioContext.resume();
        //         },
        //         onError: function (error) {
        //             audioContext.resume();
        //         }
        //     }
        // })

        mandarines = null;

        localStorage.setItem("max_score", this.maxScore);

        this.menu.style.transform = "translateY(0%)";
        this.menu.querySelector(".start_dialog .title_page").innerText = "Игра окончена";
        this.localScore.style.removeProperty("display");
        this.localScore.innerText = "Текущий счёт: " + score;
        this.subtitlePage.innerText = "Максимальный счёт: " + this.maxScore;
        this.menu.querySelector(".start_dialog .button_page.bot").innerText = "Включить бота";
    }
}

window.addEventListener("load", () => {
    gameInit();
});

document.addEventListener("visibilitychange", function () {
    onPause(document.hidden, true, true);
});
window.addEventListener("resize", function () {
    gameInit(false);
});

function onPause(paus = true, full = false, isTab = false) {
    if (menu.isOpen || (!(isTab && !paus))) {
        document.querySelectorAll(".mandarin").forEach((elem) => {
            elem.style.animationPlayState = paus ? "paused" : "running";
            elem.getBoundingClientRect();
        });
        isPaused = paus;
        document.querySelector(".pauseButton").src = isPaused ? "imgs/play_arrow_black_24dp.svg" : "imgs/pause_black_24dp.svg";

        backGround.animAir.style.animationPlayState = paus ? "paused" : "running";
        backGround.animWater.style.animationPlayState = paus ? "paused" : "running";

        if (!menu.isOpen) {
            if (isPaused) {
                menu.openPause();
            } else {
                menu.closePause();
            }
        }

        if (full && isMusic) {
            isMusicPause = paus;
            if (isMusicPause) {
                audioContext.suspend();
            } else {
                audioContext.resume();
            }
        }
    }
}

let timeCloud = 30 * 1000;

let timeWater = 20 * 1000;

fetch("./music/background.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => backgroundAudioBuffer = decode);
fetch("./music/pickup.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => pickupAudioBuffer = decode);
fetch("./music/lose_0.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => loseAudioBuffer[0] = (decode));
fetch("./music/lose_1.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => loseAudioBuffer[1] = decode);
fetch("./music/lose_2.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => loseAudioBuffer[2] = decode);
fetch("./music/lose_3.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => loseAudioBuffer[3] = decode);
fetch("./music/walk_0.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => walkAudioBuffer[0] = decode);
fetch("./music/walk_1.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => walkAudioBuffer[1] = decode);
fetch("./music/walk_2.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => walkAudioBuffer[2] = decode);
fetch("./music/walk_3.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => walkAudioBuffer[3] = decode);
fetch("./music/walk_4.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => walkAudioBuffer[4] = decode);
fetch("./music/walk_5.mp3")
    .then(data => data.arrayBuffer())
    .then(arr => audioContext.decodeAudioData(arr))
    .then(decode => walkAudioBuffer[5] = decode);

function playAudio(buffer, volume) {
    let sound = audioContext.createBufferSource();
    let gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    sound.buffer = buffer;
    sound.connect(gainNode).connect(audioContext.destination);
    sound.start(0);

    return sound;
}

function gameInit(isStart = true) {
    _8__px = parseFloat(window.getComputedStyle(document.body).getPropertyValue('--8-px'));
    _current_8_px = document.documentElement.clientWidth * _8__px / 100;

    if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
        document.body.querySelector(".game_buttons").className = "game_buttons button_type_1";
        if (isMobile) {
            fullScreenCancel(document.body);
        }
    } else {
        document.body.querySelector(".game_buttons").className = "game_buttons";
        if (isMobile) {
            fullScreen(document.body);
        }
    }

    let bottomWrapper = document.querySelector(".bottom_wrapper");

    let stoneWrapper = bottomWrapper.querySelector(".stone_wrapper");

    let rect = bottomWrapper.getBoundingClientRect();
    let stone = stoneWrapper.querySelector(".stone");
    let imageStone = new Image();
    imageStone.src = stone.src;
    imageStone.onload = () => {
        while (rect.top + stoneWrapper.parentNode.offsetHeight < document.documentElement.clientHeight) {
            stoneWrapper.parentNode.appendChild(stoneWrapper.cloneNode(true));
        }
    }
    airInit();
    if (isStart) {
        bot = new Bot();
        backGround = new BackGround();
        menu = new Menu();
        capy = new CapyPlayer();
        // YaGames
        //     .init()
        //     .then(_sdk => {
        //         ysdk = _sdk;
        //
        //         ysdk.features.LoadingAPI?.ready();
        //     }).catch(console.error);

        mainLoop();
    }
}

function fullScreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
}

function fullScreenCancel() {
    if (document.requestFullscreen) {
        document.requestFullscreen();
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

let lastMoveTime = 60;
let lastWeatherTime = timeCloud;
let lastWaterTime = timeWater;
let lastBackgroundTime = 100;
let lastMandarineSpawnTime = 60;
let lastBotII = 60;

function mainLoop() {
    let localTime = new Date().getTime();

    if (localTime - lastMoveTime >= 60) {
        capy.createAnim();
        lastMoveTime = localTime;
    }
    // if (localTime - lastWeatherTime >= timeCloud) {
    //     backGround.animWeatherMethodRestart();
    //     lastWeatherTime = localTime;
    // }
    // if (localTime - lastWaterTime >= timeWater) {
    //     backGround.animWaterMethodRestart();
    //     lastWaterTime = localTime;
    // }
    if (localTime - lastBackgroundTime >= 100) {
        backGround.animBackground();
        lastBackgroundTime = localTime;
    }
    if (mandarines != null && localTime - lastMandarineSpawnTime >= 60) {
        mandarines.spawnMandarineCycle();
        lastMandarineSpawnTime = localTime;
    }
    if (mandarines != null) {
        mandarines.hitBoxMandarineCycle();
    }
    if (bot.isBot() && localTime - lastBotII >= 60) {
        bot.botII();
        lastBotII = localTime;
    }

    menu.playBackground();

    requestAnimationFrame(mainLoop);
}