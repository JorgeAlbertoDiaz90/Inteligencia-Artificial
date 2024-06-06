// Constantes del juego
const WIDTH = 400;  // Ancho del área de juego
const HEIGHT = 400;  // Altura del área de juego
const FPS = 30;  // Cuadros por segundo
const PLAYER_SPEED = 300;  // Velocidad de movimiento del jugador
const BALL_SPEED = 400;  // Velocidad de movimiento de la bola
const PAUSE_TEXT = 'Pausa';  // Texto que se muestra en el botón de pausa
const PAUSE_STYLE = { font: '20px Arial', fill: '#fff' };  // Estilo del texto de pausa

// Variables globales
var player, background, ball, pauseLabel, menu;  // Elementos del juego
var cursors, nnNetwork, nnTrainer, nnOutput, trainingData = [];  // Teclas de flecha, red neuronal, entrenador, salida y datos de entrenamiento
var isAutoMode = false, isTrainingComplete = false;  // Indicadores de estado del juego
var returningV = false, returningH = false;  // Indicadores de retorno al centro
var JX = 250, JY = 250;  // Coordenadas del jugador

// Inicialización del juego Phaser
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, '', {
    preload: preload,  // Función de precarga
    create: create,  // Función de creación
    update: update,  // Función de actualización
    render: render  // Función de renderizado
});

// Precarga de assets del juego
function preload() {
    game.load.image('background', 'assets/game/fondo1.png');  // Carga la imagen de fondo
    game.load.spritesheet('player', 'assets/sprites/altair.png', 32, 48);  // Carga el sprite del jugador
    game.load.image('menu', 'assets/game/menu.png');  // Carga la imagen del menú
    game.load.image('ball', 'assets/sprites/purple_ball.png');  // Carga la imagen de la bola
}

// Inicialización de elementos del juego
function create() {
    // Inicialización de sistema de física
    game.physics.startSystem(Phaser.Physics.ARCADE);  // Inicia el sistema de física
    game.physics.arcade.gravity.y = 0;  // Establece la gravedad en 0 para el movimiento libre
    game.time.desiredFps = FPS;  // Establece la tasa de cuadros por segundo

    // Creación del fondo y jugador
    background = game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'background');  // Crea el fondo del juego
    player = game.add.sprite(WIDTH / 2, HEIGHT / 2, 'player');  // Crea el sprite del jugador en el centro
    game.physics.enable(player);  // Habilita la física para el jugador
    player.body.collideWorldBounds = true;  // Hace que el jugador colisione con los límites del mundo
    var run = player.animations.add('run', [8, 9, 10, 11]);  // Añade la animación de correr al jugador
    player.animations.play('run', 10, true);  // Reproduce la animación de correr

    // Creación de la bola
    ball = game.add.sprite(0, 0, 'ball');  // Crea el sprite de la bola
    game.physics.enable(ball);  // Habilita la física para la bola
    ball.body.collideWorldBounds = true;  // Hace que la bola colisione con los límites del mundo
    ball.body.bounce.set(1);  // Establece el rebote de la bola
    setRandomBallVelocity();  // Establece una velocidad aleatoria para la bola

    // Creación de etiqueta para pausa
    pauseLabel = game.add.text(WIDTH - 100, 20, PAUSE_TEXT, PAUSE_STYLE);  // Crea la etiqueta de pausa
    pauseLabel.inputEnabled = true;  // Habilita la interacción con la etiqueta de pausa
    pauseLabel.events.onInputUp.add(pauseGame, this);  // Añade el evento de pausa al hacer clic en la etiqueta
    game.input.onDown.add(handlePauseClick, this);  // Añade el evento para manejar clics cuando el juego está pausado

    // Captura de teclas de flecha
    cursors = game.input.keyboard.createCursorKeys();  // Captura las teclas de flecha para controlar al jugador

    // Inicialización de red neuronal y entrenador
    nnNetwork = new synaptic.Architect.Perceptron(3, 6, 6, 6, 5);  // Red neuronal con 3 neuronas de entrada, tres capas ocultas con 6 neuronas cada una y 5 neuronas de salida
    nnTrainer = new synaptic.Trainer(nnNetwork);  // Entrenador para la red neuronal
}

// Establece una velocidad aleatoria para la bola
function setRandomBallVelocity() {
    var angle = game.rnd.angle();  // Obtiene un ángulo aleatorio
    ball.body.velocity.set(Math.cos(angle) * BALL_SPEED, Math.sin(angle) * BALL_SPEED);  // Establece la velocidad de la bola
}

// Pausa el juego y muestra el menú de pausa
function pauseGame() {
    game.paused = true;  // Pausa el juego
    menu = game.add.sprite(WIDTH / 2, HEIGHT / 2, 'menu');  // Crea el sprite del menú en el centro
    menu.anchor.setTo(0.5, 0.5);  // Establece el ancla del menú en el centro
}

// Maneja los clics en el menú de pausa
function handlePauseClick(event) {
    // Cálculo de límites del menú de pausa
    if (game.paused) {
        var menuBounds = {
            x1: WIDTH / 2 - 270 / 2,
            x2: WIDTH / 2 + 270 / 2,
            y1: HEIGHT / 2 - 180 / 2,
            y2: HEIGHT / 2 + 180 / 2
        };

        // Acciones basadas en la posición del clic
        if (event.x > menuBounds.x1 && event.x < menuBounds.x2 && event.y > menuBounds.y1 && event.y < menuBounds.y2) {
            if (event.y <= menuBounds.y1 + 90) {
                resetTraining();  // Reinicia el entrenamiento si se hace clic en la parte superior del menú
            } else if (event.y > menuBounds.y1 + 90) {
                if (!isTrainingComplete) {
                    console.log("Entrenamiento " + trainingData.length + " valores");
                    nnTrainer.train(trainingData, { rate: 0.0003, iterations: 10000, shuffle: true });  // Entrena la red neuronal
                    isTrainingComplete = true;  // Marca el entrenamiento como completo
                }
                isAutoMode = true;  // Activa el modo automático
            }
            menu.destroy();  // Elimina el menú
            resetGame();  // Reinicia el juego
            game.paused = false;  // Despausa el juego
        }
    }
}

// Reinicia los datos de entrenamiento
function resetTraining() {
    isTrainingComplete = false;  // Marca el entrenamiento como no completo
    trainingData = [];  // Vacía los datos de entrenamiento
    isAutoMode = false;  // Desactiva el modo automático
}

// Reinicia el estado del juego
function resetGame() {
    player.x = WIDTH / 2;  // Restablece la posición del jugador en X
    player.y = HEIGHT / 2;  // Restablece la posición del jugador en Y
    player.body.velocity.x = 0;  // Detiene la velocidad del jugador en X
    player.body.velocity.y = 0;  // Detiene la velocidad del jugador en Y

    ball.x = 0;  // Restablece la posición de la bola en X
    ball.y = 0;  // Restablece la posición de la bola en Y
    setRandomBallVelocity();  // Establece una velocidad aleatoria para la bola
}

// Actualiza la lógica del juego en cada cuadro
function update() {
    background.tilePosition.x -= 1;  // Mueve el fondo para crear un efecto de desplazamiento

    if (!isAutoMode) {
        handlePlayerInput();  // Maneja la entrada del jugador
    }

    game.physics.arcade.collide(ball, player, handleCollision, null, this);  // Detecta colisiones entre la bola y el jugador

    var dx = ball.x - player.x;  // Diferencia en X entre la bola y el jugador
    var dy = ball.y - player.y;  // Diferencia en Y entre la bola y el jugador
    var distance = Math.sqrt(dx * dx + dy * dy);  // Distancia euclidiana entre la bola y el jugador

    if (!isAutoMode) {
        storeTrainingData(dx, dy, distance);  // Almacena los datos de entrenamiento si no está en modo automático
    } else if (isAutoMode && evaluateMovement([dx, dy, distance, JX, JY])) {
        autoMovePlayer(dx, dy, distance);  // Mueve al jugador automáticamente basado en los datos de entrenamiento
    }
}

// Maneja la entrada del jugador desde el teclado
function handlePlayerInput() {
    player.body.velocity.x = 0;  // Detiene la velocidad del jugador en X
    player.body.velocity.y = 0;  // Detiene la velocidad del jugador en Y

    if (cursors.left.isDown) {
        player.body.velocity.x = -PLAYER_SPEED;  // Mueve al jugador a la izquierda
    } else if (cursors.right.isDown) {
        player.body.velocity.x = PLAYER_SPEED;  // Mueve al jugador a la derecha
    }

    if (cursors.up.isDown) {
        player.body.velocity.y = -PLAYER_SPEED;  // Mueve al jugador hacia arriba
    } else if (cursors.down.isDown) {
        player.body.velocity.y = PLAYER_SPEED;  // Mueve al jugador hacia abajo
    }
}

// Almacena los datos de entrenamiento para la red neuronal
function storeTrainingData(dx, dy, distance) {
    // Cálculo de dirección del movimiento del jugador
    var left = 0, right = 0, up = 0, down = 0, moving = 0;
    if (dx > 0) left = 1;
    else right = 1;
    if (dy > 0) up = 1;
    else down = 1;
    
    if (player.body.velocity.x != 0 || player.body.velocity.y != 0) moving = 1;

    JX = player.x;  // Guarda la posición del jugador en X
    JY = player.y;  // Guarda la posición del jugador en Y

    trainingData.push({
        'input': [dx, dy, distance, JX, JY],  // Datos de entrada
        'output': [left, right, up, down, moving]  // Datos de salida
    });

    console.log(
        "Diferencia de la posición de la bola contra la del jugador en X: ", dx + "\n" +
        "Diferencia de la posición de la bola contra la del jugador en Y: ", dy + "\n" +
        "Distancia euclidiana entre la bola y el jugador: ", distance + "\n" +
        "Posición del jugador en X: ", JX + "\n" +
        "Posición del jugador en Y: ", JY + "\n"
    );
    console.log(
        "Izquierda: ", left + "\n" +
        "Derecha: ", right + "\n" +
        "Arriba: ", up + "\n" +
        "Abajo: ", down + "\n" +
        "Movimiento: ", moving + "\n"
    );
}

// Evalúa el movimiento basado en la salida de la red neuronal
function evaluateMovement(input) {
    nnOutput = nnNetwork.activate(input);  // Activa la red neuronal con la entrada
    return nnOutput[4] * 100 >= 20;  // Evalúa si la salida es suficiente para moverse
}

// Mueve al jugador automáticamente basado en la salida de la red neuronal
function autoMovePlayer(dx, dy, distance) {
    if (distance <= 150) {
        var verticalMove = evaluateVerticalMovement([dx, dy, distance, JX, JY]);
        var horizontalMove = evaluateHorizontalMovement([dx, dy, distance, JX, JY]);
        adjustPlayerVelocity(verticalMove, horizontalMove, distance);  // Ajusta la velocidad del jugador
        handleReturnToCenter();  // Maneja el retorno del jugador al centro
    } else if (distance >= 200) {
        player.body.velocity.x = 0;  // Detiene la velocidad del jugador en X
        player.body.velocity.y = 0;  // Detiene la velocidad del jugador en Y
    }
}

// Evalúa el movimiento vertical basado en la salida de la red neuronal
function evaluateVerticalMovement(input) {
    nnOutput = nnNetwork.activate(input);  // Activa la red neuronal con la entrada
    return nnOutput[2] >= nnOutput[3];  // Evalúa si el movimiento vertical es mayor o igual al movimiento horizontal
}

// Evalúa el movimiento horizontal basado en la salida de la red neuronal
function evaluateHorizontalMovement(input) {
    nnOutput = nnNetwork.activate(input);  // Activa la red neuronal con la entrada
    return nnOutput[0] >= nnOutput[1];  // Evalúa si el movimiento horizontal es mayor o igual al movimiento vertical
}

// Ajusta la velocidad del jugador basado en la evaluación de movimiento
function adjustPlayerVelocity(verticalMove, horizontalMove, distance) {
    if (verticalMove && !returningV) {
        player.body.velocity.y -= 35;  // Mueve al jugador hacia arriba
    } else if (!verticalMove && !returningV && distance <= 105) {
        player.body.velocity.y += 35;  // Mueve al jugador hacia abajo
    }

    if (horizontalMove && !returningH) {
        player.body.velocity.x -= 35;  // Mueve al jugador a la izquierda
    } else if (!horizontalMove && !returningH && distance <= 105) {
        player.body.velocity.x += 35;  // Mueve al jugador a la derecha
    }
}

// Maneja el retorno del jugador al centro del área de juego
function handleReturnToCenter() {
    // Si el jugador está demasiado a la derecha o demasiado a la izquierda
    if (player.x > 350) {
        player.body.velocity.x = -200;  // Mueve al jugador hacia la izquierda
        returningH = true;  // Marca que el jugador está retornando horizontalmente
    } else if (player.x < 50) {
        player.body.velocity.x = 200;  // Mueve al jugador hacia la derecha
        returningH = true;  // Marca que el jugador está retornando horizontalmente
    } else if (returningH && (player.x >= 50 && player.x <= 350)) {
        player.body.velocity.x = 0;  // Detiene el movimiento horizontal
        returningH = false;  // Marca que el jugador ha retornado horizontalmente
    }

    // Si el jugador está demasiado arriba o demasiado abajo
    if (player.y > 350) {
        player.body.velocity.y = -200;  // Mueve al jugador hacia arriba
        returningV = true;  // Marca que el jugador está retornando verticalmente
    } else if (player.y < 50) {
        player.body.velocity.y = 200;  // Mueve al jugador hacia abajo
        returningV = true;  // Marca que el jugador está retornando verticalmente
    } else if (returningV && (player.y >= 50 && player.y <= 350)) {
        player.body.velocity.y = 0;  // Detiene el movimiento vertical
        returningV = false;  // Marca que el jugador ha retornado verticalmente
    }
}

// Maneja la colisión entre la bola y el jugador
function handleCollision() {
    isAutoMode = true;  // Activa el modo automático
    pauseGame();  // Pausa el juego
}

// Renderiza el estado del juego o información adicional si es necesario
function render() {
    // Puede agregar lógica de renderizado personalizada aquí si es necesario
}
