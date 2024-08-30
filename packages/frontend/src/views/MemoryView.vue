<script setup>

// ################################
// IMPORTS
// ################################
import { onMounted, ref } from 'vue';
import API from "@/utils/apiWrapper";
import CustomDialog from '@/components/CustomDialog.vue';

import { useLocalUserStore } from '@/stores/localUser';

import config from "@/../config";


const localUserStore = useLocalUserStore();
// ################################
// VARIABLES
// ################################
const lostGameCustomDialog = ref(null);
const winGameCustomDialog = ref(null);

const title = 'Memory';

const winnerNameElem = ref(null);

const lastCard = ref(null);

const isPlaying = ref(false);

const isLastMatched = ref(true);

const bestPlayers = ref([]);

const cardElement = ref(null);
const lastCardElement = ref(null);

const matchedCards = ref([]);

const isTimerRunning = ref(false);

const shuffledCards = ref([]);

const memorycards = ref([]);

const time = ref(0);

const allMemoryButtons = ref([]);

//TMP BEST PLAYERS
bestPlayers.value = [
    { difficulty: 'Easy', name: 'MR', time: 60 },
    { difficulty: 'Medium', name: 'MR', time: 120 },
    { difficulty: 'Hard', name: 'MR', time: 240 },
];

const diff_levels = [
    { id: 1, name: 'Easy',      pairs: 9,   time: 60},
    { id: 2, name: 'Medium',    pairs: 15,  time: 120},
    { id: 3, name: 'Hard',      pairs: 24,  time: 240},
];

const selectedLevel = ref(null);

const changeDiff = ref(true);

const selectLevel = (level) => {
    selectedLevel.value = level;
    changeDiff.value = false;
};



// ################################
// METHODS
// ################################

// Timer
setInterval(() => {
    if(isPlaying.value) {
        if(time.value < selectedLevel.value.time) {
            // time is still running
            console.log(localUserStore);
        } else {
            //lost the game

            if(localUserStore.user.operator) {
                return;
            }
            lostGame();
        }
        if(localUserStore.user.operator) {
            return;
        }
        time.value++;
    }
}, 1000);

// save name
const saveName = async() => {
    const name = winnerNameElem.value.value;
    const timeUsed = time.value;
    const difficulty = selectedLevel.value.name;
    bestPlayers.value.push({ difficulty: difficulty, name: name, time: timeUsed });

    const data = {
        userName: name,
        time: timeUsed,
        difficulty: difficulty,
    };
    
    winGameCustomDialog.value.hide();
    const res = await API.fireServer("/api/v1/memories", {
        method: "POST",
        body: JSON.stringify(data),
    });

    
    if(res.status === 200) {
        console.log('Saved');
    } else {
        console.log('Error saving');
    }

    reset();
};

// set game as lost
const lostGame = () => {
    isPlaying.value = false;
    reset();
    lostGameCustomDialog.value.show();
};

// set game as won
const winGame = () => {
    isPlaying.value = false;
    winGameCustomDialog.value.show();
};

// reset game variables to initial state
const reset = () => {
    time.value = 0;
    selectedLevel.value = null;
    isPlaying.value = false;
    changeDiff.value = true;
    shuffledCards.value = [];
    lastCard.value = null;
    isLastMatched.value = true;
    cardElement.value = null;
    lastCardElement.value = null;
    matchedCards.value = [];
};

// prepare game and start
const start = () => {
    if (selectedLevel.value) {
        startGame(selectedLevel.value);
    } else {
        console.log('Please select a level');
    }
};

// start the game
const startGame = (level) => {
    isPlaying.value = true;
    console.log('Starting game with level: ', level);
    const cards = generateCards(level.pairs);

    shuffledCards.value = shuffle(cards);

    memorycards.value = document.getElementsByClassName('memorycard');
};

// flip card and check if it is a match
const flipCard = async (card) => {

    // check if game is running or card is already matched or same card is clicked
    if(isTimerRunning.value) {
        return;
    }
    if(matchedCards.value.includes(card)) {
        return;
    }
    if(card === lastCard.value) {
        return;
    }

    allMemoryButtons.value = document.getElementsByClassName('memorycard');


    /*
    if(!isLastMatched.value) {
        isLastMatched.value = true;
        await new Promise(r => setTimeout(r, 500));
        return;
    }*/

    if(!lastCard.value) {
        // first card
        lastCard.value = card;
        cardElement.value = document.getElementById(card.id);
        isLastMatched.value = true;
        cardElement.value.innerHTML = card.value;
        return;
    } else {
        if (lastCard.value.value === card.value) {
            // card matched
            isLastMatched.value = true;

            matchedCards.value.push(card);
            matchedCards.value.push(lastCard.value);


            cardElement.value = document.getElementById(card.id);
            cardElement.value.innerHTML = card.value;
            lastCardElement.value = document.getElementById(lastCard.value.id);
            lastCardElement.value.innerHTML = lastCard.value.value;

        } else {

            // card not matched
            for (let i = 0; i < memorycards.value.length; i++) {
                // make cards unclickable
                memorycards.value[i].style.pointerEvents = 'none';
            }

            isLastMatched.value = false;
            cardElement.value = document.getElementById(card.id);
            cardElement.value.innerHTML = card.value;
            lastCardElement.value = document.getElementById(lastCard.value.id);
            isTimerRunning.value = true;

            // grey design for cooldown 
            for (let i = 0; i < memorycards.value.length; i++) {
                memorycards.value[i].style.backgroundColor = 'grey';
            }

            // cooldown
            await new Promise(r => setTimeout(r, 500));

            // make cards clickable again
            for (let i = 0; i < memorycards.value.length; i++) {
                memorycards.value[i].style.pointerEvents = 'auto';

            }

            // hide cards value
            isTimerRunning.value = false;
            cardElement.value.innerHTML = '';
            lastCardElement.value.innerHTML = '';

            // reset card colors
            for (let i = 0; i < memorycards.value.length; i++) {
                memorycards.value[i].style.backgroundColor = '';
            }
        }
        
        if(matchedCards.value.length === shuffledCards.value.length) {
            
            // win game
            winGame();

            }
        lastCard.value = null;
    
    }
};

const shuffle = (array) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 


const generateCards = (pairs) => {
    const cards = [];
    for (let i = 0; i < pairs; i++) {
        cards.push({ id: i, value: i });
        cards.push({ id: i + pairs, value: i });
    }
    return cards;
};

onMounted(() => {
    // Change the title of the page
    document.title = `Memory - ${config.app_name}`;

});


</script>

<template>

    <CustomDialog 
    ref="lostGameCustomDialog" 
    :is-acknowledgement="true"
    confirm-name="close"
    @confirm="lostGameCustomDialog.hide()">
        <template v-slot:title>
            <h2>Game Over</h2>
        </template>
        <template v-slot:content>
            <p>You Lost, used too much time</p>
        </template>
    </CustomDialog>

    <CustomDialog
    ref="winGameCustomDialog"
    :is-acknowledgement="true"
    confirm-name="Save"
    cancel-name="Close"
    @confirm="saveName()"
    @close="winGameCustomDialog.hide()">
        <template v-slot:title>
            <h2>Game Over</h2>
        </template>
        <template v-slot:content>
            <p>You Won, you are the best</p>
            <input ref="winnerNameElem" class="input input-bordered w-full max-w-xs" type="text" placeholder="Enter your name" />
        </template>
    </CustomDialog>

    
    <h1>Memory by MR</h1>

    <div>
        <ul v-if="!selectedLevel || changeDiff">
            <li class="flex pt-[17px]" v-for="level in diff_levels" :key="level.id">
                <button class="btn btn-outline" @click="selectLevel(level)">{{ level.name }}</button>
            </li>
        </ul>
        <ul v-else>
            <li class="pt-[17px]">
                <span>Level: {{ selectedLevel.name }}</span><br>
                <button @click="reset">change level<i class="bi bi-arrow-counterclockwise"></i></button>
            </li>
            <li class="pt-[17px]">
                <button class="btn btn-outline" @click="start">Start</button>
            </li>
        </ul>
    </div>
    <div v-if="!isPlaying">
        <br>
        <span>Best Players :</span>
        <ul>
            <li v-for="bestPlayer in bestPlayers" >Diff : {{ bestPlayer.difficulty }} | Name : {{ bestPlayer.name }} | Time used : {{ bestPlayer.time }}</li>
        </ul>
        <br>
        <span>Difficulty Levels :</span>
        <ul>
            <li v-for="level in diff_levels">{{ level.name }} : {{ level.pairs }} Pairs, {{ level.time }} seconds</li>
        </ul>
    </div>
    <div v-if="isPlaying">
        <span>Timer : {{ selectedLevel.time - time}}</span>
        <div class="grid grid-cols-3 gap-4">
            <div class="btn btn-outline memorycard" v-for="card in shuffledCards" :key="card.id" @click="flipCard(card)">
                <div :id="card.id"></div>
            </div>
        </div>
    </div>
</template>