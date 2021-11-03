let home = $(".home");
let game = $(".game");
let plane = $(".plane");
let game1 = $(".game_b");
let rank = $(".rank");
let g = {
    time:0,
    life:3,
    score:0
};


function update(){
    let rgb = /^.{3,20}$/;
    let name = $(".name").val();

    if (!rgb.test(name)){
        alert("请输入3-20字符")
    }else {
        $(".btn").click(function () {
            home.fadeOut(500);
            game.fadeIn(50);
            if (!g.state){
                Game();
                $(".play-item").html(name)
            }
            g.state = true
        });
    }
}




function Game() {
    setInterval(function () {
        if (g.state){
            g.time++;
            $(".time_n").html(g.time);

        }
    },1000);
    
    
    function requestLoop(callback) {
        let isContinue = callback();
        if (isContinue) {
            requestAnimationFrame(function () {
                requestLoop(callback)
            })
        }
    }

    function hit(a, b) {
        let l1 = a.position().left;
        let r1 = l1 + a.width();
        let t1 = a.position().top;
        let b1 = t1 + a.height();

        let l2 = b.position().left;
        let r2 = l2 + b.width();
        let t2 = b.position().top;
        let b2 = t2 + b.height();

        return l1 < r2 && r1 > l2 && t1 < b2 && b1 > t2
    }


    let dir = {
        ArrowRight: false,
        ArrowLeft: false,
    };
    planeMove();

    function planeMove() {
        if (g.state) {
            if (dir.ArrowRight) {
                plane.css("left", parseInt(plane.css("left")) + 7 + "px")
            }
            if (dir.ArrowLeft) {
                plane.css("left", parseInt(plane.css("left")) - 7 + "px")
            }
            if (parseInt(plane.css("left")) < 30) {
                plane.css("left", "30px")
            }
            if (parseInt(plane.css("left")) > 1300) {
                plane.css("left", "1300px")
            }
        }
        requestAnimationFrame(planeMove)
    }

    window.addEventListener('keydown', function (e) {
        dir[e.key] = true
    });
    window.addEventListener('keyup', function (e) {
        dir[e.key] = false
    });

    const Formation = [
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    let beeSize = 50 + 10;
    const CreateBee = function (Formation) {
        let TypeOfBee = [
            "small-bee",
            "red-bee",
            "blue-bee",
            "green-bee",
            "green-bee",
            "green-bee",
        ];
        Formation.forEach(function (rowFormation, row) {
            rowFormation.forEach(function (set, col) {
                if (set) {
                    let bee = document.createElement('div');
                    bee.className = `enemy ${TypeOfBee[row]} col-${col} row-${row}`;
                    bee.style.left = `${col * beeSize + 400}px`;
                    bee.style.top = `${row * beeSize + 30}px`;
                    $(bee).attr({row: row, col: col});
                    bee.row = row;
                    bee.col = col;
                    bee.isAttacked = false;
                    game1[0].append(bee)
                }
            })
        })
    };
    CreateBee(Formation);

    let step = 0;
    let direction = "right";
    const FormationMove = function (direction) {
        Formation.forEach((rowFormation, row) => {
            rowFormation.forEach((set, col) => {
                if (set) {
                    let bee = $(`.row-${row}.col-${col}`)[0];
                    if (direction === "right") {
                        bee.style.left = `${col * beeSize + 400 + 3 * step}px`;
                        bee.style.top = `${row * beeSize + 30}px`;
                    } else {
                        bee.style.left = `${col * beeSize + 400 + 3 * step}px`;
                        bee.style.top = `${row * beeSize + 30}px`;
                    }
                }
            })
        })
    };

    setTimeout(function () {
        requestLoop(function () {
            if (direction === "right") {
                step++;
                if (step === 140) {
                    direction = "left"
                }
                FormationMove(direction)
            } else {
                if (direction === "left") {
                    step--;
                    if (step === -140) {
                        direction = "right"
                    }
                    FormationMove(direction)
                }
            }
            return true
        })
    }, 1050);


    class bullet {
        constructor(x,y) {
            let bullet = document.createElement('div');
            bullet.className = "bullet";
            bullet.style.left = x + "px";
            bullet.style.top = y + "px";
            game1[0].append(bullet);
            this.dom = bullet;
            this.speed = 14;
            this.move()
        }

        move() {
            requestLoop(() => {
                let ishit = false;
                this.dom.style.top = this.dom.offsetTop - this.speed + "px";

                $(".enemy").each((i, bee) => {
                    if (hit($(this.dom), $(bee))) {

                        ishit = true;
                        bee.remove();

                        Formation[bee.row][bee.col] = 0;

                        if (g.state){
                            g.score+=300;
                            $(".score_n").html(g.score)
                        }

                    }
                    if ($(".enemy").length == 0) {
                        if(g.state){
                            game.fadeOut(400);
                            g.state = false;
                            rank.fadeIn(500);
                            local();
                            $(".lose").html("YOUR WIN")
                        }
                    }

                });
                if (this.dom.offsetTop < 0 || ishit) {
                    this.dom.remove();
                    return false;
                } else {
                    return true;
                }

            })
        }
    }

    class EnemyBullet extends bullet {
        constructor(x, y) {
            super(x, y);
            this.delta = (plane[0].offsetLeft - x) / (plane.offset().top - y)
        }

        move() {
            requestLoop(() => {
                let ishit = false;
                this.dom.style.left = this.dom.offsetLeft + this.delta * this.speed + "px";
                this.dom.style.top = this.dom.offsetTop + this.speed + "px";

                if (hit($(this.dom), $(plane))) {
                    ishit = true;
                    if (g.state) {
                        g.life--;
                        $(".life-img")[0].remove();
                        if (g.life === 0) {
                            game.fadeOut(400);
                            g.state = false;
                            rank.fadeIn(500);
                            local();
                        }
                    }
                }

                if (this.dom.offsetTop > window.innerHeight || ishit) {
                    this.dom.remove();
                    return false;
                } else {
                    return true
                }
            });

        }
    }

    window.addEventListener('keydown', function (e) {
        // if ($(".bullet").length >= 2) {
        //
        // } else
            if (e.key === " ") {
            new bullet(parseInt(plane[0].offsetLeft), plane.offset().top)
        }
    });

    class Bezier {
        constructor(point) {
            this.point = point;
        }

        excute() {
            let unit = 120;
            let x = [];
            let y = [];
            let t = 0;
            for (let i = 0; i < 120; i++) {
                t = i / 120;
                let point = this.calculate(this.point, t);
                x.push(point.x);
                y.push(point.y);
            }
            return {x, y}
        }

        calculate(points, t) {
            if (points.length <= 2) {
                return {
                    x: (1 - t) * points[0].x + t * points[1].x,
                    y: (1 - t) * points[0].y + t * points[1].y
                }
            } else {
                let dropPoints = [];
                for (let i = 0; i < points.length - 1; i++) {
                    dropPoints.push(this.calculate([
                        points[i],
                        points[i + 1]
                    ], t))
                }
                return this.calculate(dropPoints, t)
            }
        }
    }

    const attackedOfBee = function (bee, point, isOver = false) {
        let b = new Bezier(point);
        let points = b.excute();
        let stop = 0;
        requestLoop(function () {
            if (stop < 120) {
                if (stop === 50 && !isOver){
                    new EnemyBullet(points.x[stop],points.y[stop])
                }
                bee.style.left = points.x[stop] + "px";
                bee.style.top = points.y[stop] + "px";
                stop++;
                return true
            } else {
                let prestep = step;
                for (let i = 0; i < 100; i++) {
                    if (direction === "right") {
                        prestep++;
                        if (step === 140) {
                            direction = "left"
                        }
                    } else if (direction === "left") {
                        prestep--;
                        if (step === -140) {
                            direction = "right"
                        }
                    }
                }
                if (isOver === false){
                    attackedOfBee(bee,[
                        {x:450,y:-60},
                        {x:parseInt($(bee).attr("col")) * 60 + 420 + 3 * prestep,y:-60},
                        {x:parseInt($(bee).attr("col")) * 60 + 420 + 3 * prestep,y:parseInt($(bee).attr("row")) * 60 + 30},
                    ],true)
                }else {
                    bee.isAttacked = false
                }
                return false
            }
        })
    };


    let attackedOfDirection = "left";
    setInterval(function () {
        for (let i = 0; i < Formation.length; i++) {
            if (attackedOfDirection === "left") {
                let col = Formation[i].indexOf(1);
                if (col > -1) {
                    attackedOfDirection = "right";
                    let bee = document.querySelector(`.row-${i}.col-${col}`);
                    if (bee && bee.isAttacked === false) {
                        bee.isAttacked = true;
                        attackedOfBee(bee, [
                            {x: bee.offsetLeft, y: bee.offsetTop},
                            {x: bee.offsetLeft, y: bee.offsetTop - 100},
                            {x: bee.offsetLeft - 520, y: bee.offsetTop - 100},
                            {x: bee.offsetLeft - 520, y: bee.offsetTop},
                            {x: bee.offsetLeft - 520, y: 450},
                            {x: plane[0].offsetLeft, y: 450},
                            {x: plane[0].offsetLeft, y: plane[0].offsetTop + 60},
                        ]);
                        requestLoop(function () {
                            let ht = hit($(bee),plane);
                            if (ht){
                                bee.remove();
                                Formation[bee.row][bee.col] = 0;

                                if (g.state) {
                                    g.life--;
                                    $(".life-img")[0].remove();
                                    if (g.life === 0) {
                                        game.fadeOut(400);
                                        g.state = false;
                                        rank.fadeIn(500);
                                        local();
                                    }
                                }
                            }
                            return !ht
                        })
                    }
                    return
                }
            }else
                if (attackedOfDirection === "right") {
                let col = Formation[i].lastIndexOf(1);
                if (col > -1) {
                    attackedOfDirection = "left";
                    let bee = document.querySelector(`.row-${i}.col-${col}`);
                    if (bee && bee.isAttacked === false) {
                        bee.isAttacked = true;
                        attackedOfBee(bee, [
                            {x: bee.offsetLeft, y: bee.offsetTop},
                            {x: bee.offsetLeft, y: bee.offsetTop - 100},
                            {x: bee.offsetLeft + 520, y: bee.offsetTop - 100},
                            {x: bee.offsetLeft + 520, y: bee.offsetTop},
                            {x: bee.offsetLeft + 520, y: 450},
                            {x: plane[0].offsetLeft, y: 450},
                            {x: plane[0].offsetLeft, y: plane[0].offsetTop + 60},
                        ]);
                        requestLoop(function () {
                            let ht = hit($(bee),plane);
                            if (ht){
                                bee.remove();
                                Formation[bee.row][bee.col] = 0;

                                if (g.state) {
                                    g.life--;
                                    $(".life-img")[0].remove();
                                    if (g.life === 0) {
                                        game.fadeOut(400);
                                        g.state = false;
                                        rank.fadeIn(500);
                                        local();

                                    }
                                }
                            }
                            return !ht
                        })
                    }
                    return
                }
            }
        }
    }, 2500);
    function local() {
        /**localstorange**/
        let thisPlayer = {
            name: $(".name").val(),
            time: g.time,
            score: g.score,
        };
        let arr = [];
        if (localStorage.lcd) {
            arr = JSON.parse(localStorage.lcd);
            arr.push(thisPlayer);
        } else {
            arr = [thisPlayer];

        }
        localStorage.lcd = JSON.stringify(arr);
        /**渲染到页面*/
        let html = "";
        for (let i = 0; i < arr.length; i++) {
            html += `
                            <div class="flex-js">
                            <div class="flex-item">${arr[i].name}</div>
                            <div class="flex-item">${arr[i].time}</div>
                            <div class="flex-item">${arr[i].score}</div>
                            </div>
                        `
        }
        $(".rank-list").append(html);

        /**localstorange**/
    }
    
    $(".restart").click(function () {
        window.location.reload()
    })

}
                 