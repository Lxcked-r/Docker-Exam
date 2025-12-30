<script setup>

import { ref, onMounted } from 'vue';
import socket from '@/utils/socket';

import { useLocalUserStore } from '@/stores/localUser';
const localUserStore = useLocalUserStore();


const game = ref(null);
const ball = ref(null);
const playerOnePaddle = ref(null);
const playerTwoPaddle = ref(null);

const playerOneName = ref('');
const playerTwoName = ref('');

const playerOneScore = ref(0);
const playerTwoScore = ref(0);

const playerOnePosition = ref(0);
const playerTwoPosition = ref(0);

const playerOneDiv = ref(null);
const playerTwoDiv = ref(null);

const maxY = 400;
const maxX = 600;


const playerOne = ref(0);
const playerTwo = ref(0);

const checkBallCollision = () => {
    if (ball.value.x <= 0) {
        playerTwoScore.value += 1;
        ball.value.x = maxX / 2;
        ball.value.y = maxY / 2;
        ball.value.dx = 3;
        ball.value.dy = 3;
    }
    
    if (ball.value.x >= maxX) {
        playerOneScore.value += 1;
        ball.value.x = maxX / 2;
        ball.value.y = maxY / 2;
        ball.value.dx = -3;
        ball.value.dy = -3;
    }
    
    if (ball.value.y <= 0 || ball.value.y >= maxY) {
        ball.value.dy *= -1;
    }
    
    if (ball.value.x <= 10 && ball.value.y >= playerOnePosition.value && ball.value.y <= playerOnePosition.value + 100) {
        ball.value.dx *= -1;
    }
    
    if (ball.value.x >= maxX-10 && ball.value.y >= playerTwoPosition.value && ball.value.y <= playerTwoPosition.value + 100) {
        ball.value.dx *= -1;
    }
    };

const update = () => {
    checkBallCollision();
    ball.value.x += ball.value.dx;
    ball.value.y += ball.value.dy;
};

const startGame = () => {
    game.value = setInterval(update, 1000 / 60);
};

const stopGame = () => {
    clearInterval(game.value);
};

const movePlayerOne = (newCoords) => {
    playerOnePosition.value = newCoords;
    if(newCoords > 510) 
    {
        newCoords = 510;
    }

    if(newCoords < 210)
    {
        newCoords = 210;
    }
    playerOneDiv.value.style.top = `${newCoords-210}px`;
};

const movePlayerTwo = (newCoords) => {
    playerTwoPosition.value = newCoords;
    if(newCoords > 510) 
    {
        newCoords = 510;
    }
    if(newCoords < 210)
    {
        newCoords = 210;
    }
    
    playerTwoDiv.value.style.top = `${newCoords-210}px`;

};

socket.on('pong:playerOne', (data) => {
    playerOneName.value = data.name;
});

socket.on('pong:playerTwo', (data) => {
    playerTwoName.value = data.name;
});

socket.on('pong:move', (data) => {
    if (data.id === playerOne.value) {
        movePlayerOne(data.coords);
    }
    
    if (data.id === playerTwo.value) {
        movePlayerTwo(data.coords);
    }
});

socket.on('pong:startGame', () => {
    startGame();
});

socket.on('pong:stopGame', () => {
    stopGame();
});

socket.on('pong:ball', (data) => {
    ball.value = data;
});

socket.on('pong:playerOneScore', (data) => {
    playerOneScore.value = data.score;
});

socket.on('pong:playerTwoScore', (data) => {
    playerTwoScore.value = data.score;
});


socket.on("pong:players", (data) => {
    playerOne.value = data[0];
    playerTwo.value = data[1];
    if (playerOne.value === 1 && playerTwo.value === 1) {
        socket.emit('pong:startGame');
    }
});



onMounted(() => {
    console.log(localUserStore.user.username);
    socket.emit('pong:join', { name: localUserStore.user.username});
     
    
    //event listener for mouse position
    window.addEventListener('mousemove', (e) => {
        socket.emit('pong:move', { name: localUserStore.user.username, coords: e.clientY });
    });
});

const moveBall = (x,y,dx,dy) => {
    ball.value = {x,y,dx,dy};
    socket.emit('pong:ball', {x,y,dx,dy});
};


</script>

<template>

    <div>
        <a target="_blank" href="https://www.youtube.com/watch?v=riBHS3ctsx0">Check This Out !</a>
        <h1>Pong</h1>
        <div>
            <div>
                <h2>{{ playerOneName }}</h2>
                <p>{{ playerOneScore }}</p>
            </div>
            <div>
                <h2>{{ playerTwoName }}</h2>
                <p>{{ playerTwoScore }}</p>
            </div>
        </div>
        <div>
            <div style="position: relative; width: 600px; height: 400px; background-color: black;">
                <div ref="playerOneDiv" style="position: absolute; left: 0; width: 10px; height: 100px; background-color: white;"></div>
                <div ref="playerTwoDiv" style="position: absolute; right: 0; width: 10px; height: 100px; background-color: white;"></div>
                <div style="position: absolute; background-color: white;"></div>
            </div>
        </div>
    </div>


</template>
<style>

</style>