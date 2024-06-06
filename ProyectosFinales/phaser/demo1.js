var w = 800;
var h = 400;
var jugador;
var fondo;
var bala, balaD = false, nave;
var bala2, balaD2 = false, nave2;
var bala3, balaD3 = false, nave3;
var salto;
var avanza;
var menu;
var velocidadBala;
var despBala;
var velocidadBala2;
var despBala2;
var velocidadBala3;
var despBalaHorizontal3;
var despBalaVertical3;
var despBala3;
var estatusAire;
var estatuSuelo;
var estatusDerecha;
var estatusIzquierda;
var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false,
    eCompleto = false;
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    // Carga los recursos del juego
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function create() {
    // Inicialización del juego
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;
    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w - 100, h - 70, 'nave');
    bala = juego.add.sprite(w - 100, h, 'bala');
    nave2 = juego.add.sprite(w - 800, h - 400, 'nave');
    bala2 = juego.add.sprite(w - 760, h - 380, 'bala');
    nave3 = juego.add.sprite(w - 100, h - 400, 'nave');
    bala3 = juego.add.sprite(w - 100, h - 370, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');
    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre', [8, 9, 10, 11]);
    jugador.animations.play('corre', 10, true);
    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;
    juego.physics.enable(nave);
    nave.body.collideWorldBounds = true;
    juego.physics.enable(bala2);
    bala2.body.collideWorldBounds = true;
    juego.physics.enable(bala3);
    bala3.body.collideWorldBounds = true;
    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);
    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    avanza = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    // La red tiene 3 neuronas de entrada, tres capas ocultas con 6 neuronas cada una y 5 neuronas de salida
    nnNetwork = new synaptic.Architect.Perceptron(6, 5, 5, 5, 4);

    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function enRedNeuronal() {
    // Entrenamiento de la red neuronal
    nnEntrenamiento.train(datosEntrenamiento, { rate: 0.0003, iterations: 10000, shuffle: true });
}

function datosDeEntrenamiento(param_entrada) {
    // Función para la red neuronal
    nnSalida = nnNetwork.activate(param_entrada);
    var aire = Math.round(nnSalida[0] * 100);
    var piso = Math.round(nnSalida[1] * 100);
    return nnSalida[0] >= nnSalida[1];
}

function pausa() {
    // Función de pausa
    juego.paused = true;
    menu = juego.add.sprite(w / 2, h / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event) {
    // Manejo del menú de pausa
    if (juego.paused) {
        var menu_x1 = w / 2 - 270 / 2,
            menu_x2 = w / 2 + 270 / 2,
            menu_y1 = h / 2 - 180 / 2,
            menu_y2 = h / 2 + 180 / 2;
        var mouse_x = event.x,
            mouse_y = event.y;
        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!eCompleto) {
                    enRedNeuronal();
                    eCompleto = true;
                }
                modoAuto = true;
            }
            resetVariables();
            resetVariables2();
            resetVariables3();
            resetPlayer();
            juego.paused = false;
            menu.destroy();
        }
    }
}

function resetVariables() {
    // Reinicia las variables de la bala 1
    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    balaD = false;
}

function resetVariables2() {
    // Reinicia las variables de la bala 2
    bala2.body.velocity.y = -270;
    bala2.position.y = h - 400;
    balaD2 = false;
}

function resetVariables3() {
    // Reinicia las variables de la bala 3
    bala3.body.velocity.y = -270;
    bala3.body.velocity.x = 0;
    bala3.position.x = w - 100;
    bala3.position.y = h - 500;
    balaD3 = false;
}

function resetPlayer() {
    // Reinicia la posición del jugador
    jugador.position.x = 70;
}

function saltar() {
    // Función para hacer saltar al jugador
    jugador.body.velocity.y = -350;
}

function correr() {
    // Función para hacer correr al jugador hacia adelante
    jugador.body.velocity.x = 0;
}

function correrAtras() {
    // Función para hacer correr al jugador hacia atrás
    jugador.body.velocity.x = -120;
}

function Detenerse() {
    // Función para detener al jugador
    jugador.body.velocity.x = 0;
}

function update() {
    
    // Actualización del juego en cada fotograma
    fondo.tilePosition.x -= 1;

    // Colisiones entre objetos
    juego.physics.arcade.collide(nave, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala3, jugador, colisionH, null, this);

    // Actualización del estado del jugador
    estatuSuelo = 1;
    estatusAire = 0;
    estatusDerecha = 0;
    estatusIzquierda = 1;
    if (!jugador.body.onFloor() || jugador.body.velocity.y != 0) {
        estatuSuelo = 0;
        estatusAire = 1;
    }
    if (jugador.body.velocity.x >= 140) {
        estatusDerecha = 1;
        estatusIzquierda = 0;
    }
    // Cálculo de desplazamientos de balas
    despBala = Math.floor(jugador.position.x - bala.position.x);
    despBala2 = Math.floor(jugador.position.x - bala2.position.x);
    despBalaHorizontal3 = Math.floor(jugador.position.x - bala3.position.x);
    despBalaVertical3 = Math.floor(jugador.position.y - bala3.position.y);
    despBala3 = Math.floor(despBalaHorizontal3 + despBalaVertical3);
    // Control de movimiento del jugador en modo manual
    if (modoAuto == false && salto.isDown && !estatusAire) {
        if (jugador.body.velocity.x <= 0) {
            jugador.body.velocity.x = 150;
            saltar();
            correr();
        } else {
            saltar();
            Detenerse();
        }
    }
    if (modoAuto == false && avanza.isDown && jugador.body.onFloor()) {
        correr();
    }
    if (modoAuto == false && jugador.body.onFloor() && jugador.position.x >= 100) {
        correrAtras();
    }
    if (modoAuto == false && !avanza.isDown && jugador.body.onFloor() && jugador.position.x == 100) {
        Detenerse();
    }
    // Control de movimiento del jugador en modo automático
    if (modoAuto == true && bala.position.x > 0 && jugador.body.onFloor()) {
        if (datosDeEntrenamiento([despBala, velocidadBala, despBala2, velocidadBala2, despBala3, velocidadBala3])) {
            if (jugador.body.velocity.x <= 0) {
                jugador.body.velocity.x = 0;
                saltar();
                correr();
            } else {
                saltar();
                Detenerse();
            }
        }
        if (datosDeEntrenamiento([despBala, velocidadBala, despBala2, velocidadBala2, despBala3, velocidadBala3])) {
            correr();
        } else if (jugador.body.onFloor() && jugador.position.x >= 250) {
            Detenerse();
            correrAtras();
        }
    }
    // Disparo de balas
    if (balaD == false) {
        disparo();
    }
    if (balaD2 == false) {
        disparo2();
    }
    if (balaD3 == false) {
        disparo3();
    }
    // Reinicio de balas fuera de pantalla
    if (bala.position.x <= 0) {
        resetVariables();
    }
    if (bala2.position.y >= 355) {
        resetVariables2();
    }
    if (bala3.position.x <= 0 || bala3.position.y >= 355) {
        resetVariables3();
    }
    // Recopilación de datos para entrenamiento en modo manual
    if (modoAuto == false && bala.position.x > 0) {
        datosEntrenamiento.push({
            'input': [despBala, velocidadBala, despBala2, velocidadBala2, despBala3, velocidadBala3],
            'output': [estatusAire, estatuSuelo, estatusDerecha, estatusIzquierda]
        });
    }
}

function disparo() {
    // Función para el disparo de la bala 1
    velocidadBala = -1 * velocidadRandom(500, 600);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBala;
    balaD = true;
}

function disparo2() {
    // Función para el disparo de la bala 2
    velocidadBala2 = -0.5 * velocidadRandom(5, 10);
    bala2.body.velocity.y = 0;
    balaD2 = true;
}

function disparo3() {
    // Función para el disparo de la bala 3
    velocidadBala3 = -1 * velocidadRandom(355, 455 );
    bala3.body.velocity.y = 0;
    bala3.body.velocity.x = 1.60 * velocidadBala3;
    balaD3 = true;
}

function colisionH() {
    // Función para manejar la colisión horizontal
    pausa();
}

function velocidadRandom(min, max) {
    // Función para generar una velocidad aleatoria
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {
    // Función de renderizado

    
    }
    