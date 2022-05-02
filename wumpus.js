class Wumpus {

    constructor() {
        this.infoMundo = new Array(8);
        this.mundoVisitado = new Array(8);

        this.pasos = [];

        this.Movimientos = {
            Derecha: 1,
            Izquierda: 2,
            Arriba: 3,
            Abajo: 4
        };

        this.shootDirection = this.Movimientos.Derecha;
        this.movTotales = 0;
        this.movRandom = 0;
        this.encontrarOro = false;
        this.Puntos = 0;
        this.gameOver = false;
    }

    reStart() {
        // Initialize world data
        for (var x = 1; x <= 8; x++) {
            this.infoMundo[x] = new Array(8);
            this.mundoVisitado[x] = new Array(8);

            for (var y = 1; y <= 8; y++) {
                this.infoMundo[x][y] = new Cell(x, y);
                this.mundoVisitado[x][y] = new CeldaVisitada(x, y);
            }
        }

        // Inicializando hoyos
        var countPit = 0;
        while (countPit < 2) {
            x = this.rand(1, 8);
            y = this.rand(1, 8);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.infoMundo[x][y].isPit)
                continue;

            this.infoMundo[x][y].setPit();
            if (y > 1) this.infoMundo[x][y - 1].setBreeze();
            if (y < 8) this.infoMundo[x][y + 1].setBreeze();
            if (x > 1) this.infoMundo[x - 1][y].setBreeze();
            if (x < 8) this.infoMundo[x + 1][y].setBreeze();
            countPit++;
        }

        // Inicializando Wumpus
        while (true) {
            x = this.rand(1, 8);
            y = this.rand(1, 8);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.infoMundo[x][y].isPit)
                continue;

            this.infoMundo[x][y].setWumpus();
            // Colocando hedor del Wumpus
            if (y > 1) this.infoMundo[x][y - 1].setStench();
            if (y < 8) this.infoMundo[x][y + 1].setStench();
            if (x > 1) this.infoMundo[x - 1][y].setStench();
            if (x < 8) this.infoMundo[x + 1][y].setStench();
            break;
        }

        // Inicializando Oro
        var countGold = 0;
        while (countGold < 2) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.infoMundo[x][y].isPit || this.infoMundo[x][y].isWumpus)
                continue;

            this.infoMundo[x][y].setGold();
            countGold++;
            //break;
        }

        this.x = 1;
        this.y = 1;
        this.infoMundo[1][1].setPlayer();

        isWumpusDead = false;
        isShooting = false;

        this.drawCell();
    }

    move() {
        console.log(isWumpusDead);

        this.CalcBreezeAndStench();

        if (this.infoMundo[this.x][this.y].isGold) {
            this.encontrarOro = true;
            this.Puntos += 1000;
            this.infoMundo[this.x][this.y].isGold = false;

        } else if (this.infoMundo[this.x][this.y].isWumpus && !isWumpusDead) {
            this.Puntos -= 10000;
            this.gameOver = true;

        } else if (this.infoMundo[this.x][this.y].isPit) {
            this.Puntos -= 10000;
            this.gameOver = true;

            // Se está cerca del Wumpus?
        } else if (!isWumpusDead && this.areWeNearOfWumpus()) {
            console.log("Shoot");
            isShooting = true;
            isWumpusDead = true;
            return this.shootDirection;

            // Se está cerca del hoyo?
        } else if (this.areWeInPitLoop()) {
            console.log("pit loop");
            if (this.x != 8 && this.mundoVisitado[this.x + 1][this.y].pitChance < 60) {
                this.movRandom = 0;
                return this.Movimientos.Derecha;
            } else if (this.y != 8 && this.mundoVisitado[this.x][this.y + 1].pitChance < 60) {
                this.movRandom = 0;
                return this.Movimientos.Top;
            } else if (this.x != 1 && this.mundoVisitado[this.x - 1][this.y].pitChance < 60) {
                this.movRandom = 0;
                return this.Movimientos.Izquierda;
            } else if (this.y != 1 && this.mundoVisitado[this.x][this.y - 1].pitChance < 60) {
                this.movRandom = 0;
                return this.Movimientos.Bottom;
            }
        } else if (this.areWeInDangerSpace()) {
            console.log("danger space");
            // si Izquierda es seguro, moverse
            if (this.x != 1 && this.infoMundo[this.x - 1][this.y].isVisited) {
                this.mundoVisitado[this.x - 1][this.y].visitedNum++;
                return this.Movimientos.Izquierda;
            }
            // si Abajo es seguro, moverse
            else if (this.y != 1 && this.infoMundo[this.x][this.y - 1].isVisited) {
                this.mundoVisitado[this.x][this.y - 1].visitedNum++;
                return this.Movimientos.Abajo;
            }
            // si Derecha es seguro, moverse
            else if (this.x != 8 && this.infoMundo[this.x + 1][this.y].isVisited) {
                this.mundoVisitado[this.x + 1][this.y].visitedNum++;
                return this.Movimientos.Derecha;
            }
            // si Arriba es seguro, moverse
            else if (this.y != 8 && this.infoMundo[this.x][this.y + 1].isVisited) {
                this.mundoVisitado[this.x][this.y + 1].visitedNum++;
                return this.Movimientos.Arriba;
            }
        } else if (this.areWeInFreeSpace) {
            console.log("free space");
            // si Derecha no se ha visitado, moverse
            if (this.x != 8 && !this.infoMundo[this.x + 1][this.y].isVisited) {
                this.mundoVisitado[this.x + 1][this.y].visitedNum++;
                return this.Movimientos.Derecha;
            }
            // si Arriba no se ha visitado, moverse
            else if (this.y != 8 && !this.infoMundo[this.x][this.y + 1].isVisited) {
                this.mundoVisitado[this.x][this.y + 1].visitedNum++;
                return this.Movimientos.Arriba;
            }
            // si Izquierda no se ha visitado, moverse
            else if (this.x != 1 && !this.infoMundo[this.x - 1][this.y].isVisited) {
                this.mundoVisitado[this.x - 1][this.y].visitedNum++;
                return this.Movimientos.Izquierda;
            }
            // si Abajo no se ha visitado, moverse
            else if (this.y != 1 && !this.infoMundo[this.x][this.y - 1].isVisited) {
                this.mundoVisitado[this.x][this.y - 1].visitedNum++;
                return this.Movimientos.Abajo;
            }
            // si todos los vecinos han sido visitados, elegir una dirección aleatoria
            else {
                console.log("free neighbor");
                while (true) {
                    switch (this.rand(1, 8)) {
                        // si se selecciona, mover Derecha
                        case 1:
                            if (this.x != 8) {
                                this.mundoVisitado[this.x + 1][this.y].visitedNum++;
                                this.movRandom++;
                                return this.Movimientos.Derecha;
                            }
                            break;
                        //si se selecciona, mover Arriba
                        case 2:
                            if (this.y != 8) {
                                this.mundoVisitado[this.x][this.y + 1].visitedNum++;
                                this.movRandom++;
                                return this.Movimientos.Arriba;
                            }
                            break;
                        //si se selecciona, mover Izquierda
                        case 3:
                            if (this.x != 1) {
                                this.mundoVisitado[this.x - 1][this.y].visitedNum++;
                                this.movRandom++;
                                return this.Movimientos.Izquierda;
                            }
                            break;
                        //si se selecciona, mover Abajo
                        case 4:
                            if (this.y != 1) {
                                this.mundoVisitado[this.x][this.y - 1].visitedNum++;
                                this.movRandom++;
                                return this.Movimientos.Abajo;
                            }
                            break;
                    }
                }
            }
        }
    }

    areWeNearOfWumpus() {
        // Si Wumpus está Arriba?, Disparar
        if (this.y != 8 && this.mundoVisitado[this.x][this.y + 1].wumpusChance >= 60) {
            this.shootDirection = this.Movimientos.Arriba;
            return true;
        }
        // Si Wumpus está Derecha?, Disparar
        else if (this.x != 8 && this.mundoVisitado[this.x + 1][this.y].wumpusChance >= 60) {
            this.shootDirection = this.Movimientos.Derecha;
            return true;
        }
        // Si Wumpus está Izquierda?, Disparar
        else if (this.x != 1 && this.mundoVisitado[this.x - 1][this.y].wumpusChance >= 60) {
            this.shootDirection = this.Movimientos.Izquierda;
            return true;
        }
        // Si Wumpus está Abajo?, Disparar
        else if (this.y != 1 && this.mundoVisitado[this.x][this.y - 1].wumpusChance >= 60) {
            this.shootDirection = this.Movimientos.Abajo;
            return true;
        }

        return false;
    }

    areWeInPitLoop() {
        if (this.movRandom > 0 && this.mundoVisitado[this.x][this.y].movTotales > 1 && this.infoMundo[this.x][this.y].isBreeze)
            return true;
        else
            return false;
    }

    areWeInDangerSpace() {
        console.log(this.x + " 1 " + this.y);
        if (this.infoMundo[this.x][this.y].isBreeze || (this.infoMundo[this.x][this.y].isStench && !isWumpusDead))
            return true;
        else
            return false;
    }

    areWeInFreeSpace() {
        if ((!this.infoMundo[this.x][this.y].isBreeze && !this.infoMundo[this.x][this.y].isStench) || (!this.infoMundo[this.x][this.y].isBreeze && this.isWumpusDead ))
            return true;
        else
            return false;
    }

    CalcBreezeAndStench() {
        //si los espacios vecinos aún no han sido calculados
        if (!this.mundoVisitado[this.x][this.y].nearDanger) {
            //si el espacio actual tiene una brisa, calcule las probabilidades del hoyo
            if (this.infoMundo[this.x][this.y].isBreeze) {
                this.PitWumpusPercentage(true, false);
            }

            //si el espacio actual huele mal, calcule las probabilidades de Wumpus
            if (this.infoMundo[this.x][this.y].isStench && !isWumpusDead) {
                this.PitWumpusPercentage(false, true);
            }
        }
    }

    PitWumpusPercentage(pit, wumpus) {
        //if Arriba not visited, add 30% chance
        if (this.y != 1 && !this.infoMundo[this.x][this.y - 1].isVisited) {
            if (pit)
                this.mundoVisitado[this.x][this.y - 1].pitChance += 30;

            if (wumpus)
                this.mundoVisitado[this.x][this.y - 1].wumpusChance += 30;
        }

        //if Arriba not visited, add 30% chance
        if (this.x != 8 && !this.infoMundo[this.x + 1][this.y].isVisited) {
            if (pit)
                this.mundoVisitado[this.x + 1][this.y].pitChance += 30;

            if (wumpus)
                this.mundoVisitado[this.x + 1][this.y].wumpusChance += 30;
        }

        //if Arriba not visited, add 30% chance
        if (this.x != 1 && !this.infoMundo[this.x - 1][this.y].isVisited) {
            if (pit)
                this.mundoVisitado[this.x - 1][this.y].pitChance += 30;

            if (wumpus)
                this.mundoVisitado[this.x - 1][this.y].wumpusChance += 30;
        }

        //if Arriba not visited, add 30% chance
        if (this.y != 8 && !this.infoMundo[this.x][this.y + 1].isVisited) {
            if (pit)
                this.mundoVisitado[this.x][this.y + 1].pitChance += 30;

            if (wumpus)
                this.mundoVisitado[this.x][this.y + 1].wumpusChance += 30;
        }

        this.mundoVisitado[this.x][this.y].nearDanger = true;
    }

    handMove(direction) {
        if (isShooting) {
            this.gameOver = true;
            $('#status').text('¡Mataste a Wumpus! Ganaste');
        } else
            switch (direction) {
                case this.Movimientos.Arriba:
                    this.infoMundo[this.x][this.y].unsetPlayer();
                    this.y++;
                    this.infoMundo[this.x][this.y].setPlayer();
                    break;

                case this.Movimientos.Derecha:
                    this.infoMundo[this.x][this.y].unsetPlayer();
                    this.x++;
                    this.infoMundo[this.x][this.y].setPlayer();
                    break;

                case this.Movimientos.Abajo:
                    this.infoMundo[this.x][this.y].unsetPlayer();
                    this.y--;
                    this.infoMundo[this.x][this.y].setPlayer();
                    break;

                case this.Movimientos.Izquierda:
                    this.infoMundo[this.x][this.y].unsetPlayer();
                    this.x--;
                    this.infoMundo[this.x][this.y].setPlayer();
                    break;
            }

        this.Puntos -= 1;
        this.drawCell();
    }

    drawCell() {
        for (var i = 1; i <= 8; i++) {
            for (var j = 1; j <= 8; j++) {
                var cell = this.infoMundo[i][j];

                var img = "";
                if (cell.isPlayer && isShooting) {
                    img = "player-armed.png";
                    isShooting = false;
                } else if (cell.isPlayer)
                    img = "player.png";
                else if (cell.isPit && cell.isBreeze)
                    img = "pit.png";
                else if (cell.isPit)
                    img = "pit.png";
                else if (cell.isStench && cell.isBreeze && cell.isGold)
                    img = "gold.png";
                else if (cell.isStench && cell.isBreeze)
                    img = "breeze-stench.png";
                else if (cell.isWumpus && cell.isBreeze && isWumpusDead)
                    img = "wumpus_dead.png";
                else if (cell.isWumpus && cell.isBreeze)
                    img = "wumpus.png";
                else if (cell.isWumpus && isWumpusDead)
                    img = "wumpus_dead.png";
                else if (cell.isWumpus)
                    img = "wumpus.png";
                else if (cell.isGold)
                    img = "gold.png";
                else if (cell.isBreeze)
                    img = "breeze.png";
                else if (cell.isStench)
                    img = "stench.png";
                else
                    img = "";

                $(".pboard .cell" + cell.x + "" + cell.y).css("background", "url(img/" + img + ") no-repeat #efefef");
                $(".pboard .cell" + cell.x + "" + cell.y).css("background-size", "60px 60px");

                if (cell.isPlayer)
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background", "url(img/player.png) no-repeat #d0d0d0");
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background-size" , "55px 60px");

                if (cell.isVisited)
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background-color", "#d0d0d0");
            }
        }

        $('#Puntoss').text('Puntos: ' + this.Puntos);
    }

    rand(min, max) {
        if (min == max)
            return min;

        var date = new Date();
        var count = date.getMilliseconds() % 10;

        for (var i = 0; i <= count; ++i)
            Math.random();

        if (min > max) {
            min ^= max;
            max ^= min;
            min ^= max;
        }

        return Math.floor((Math.random() * (max - min + 1)) + min);
    }
}   