<script setup>
import { onMounted,watch } from "vue";
import { useIdleStore } from "@/stores/idleStore";
import { storeToRefs } from "pinia";
const idleStore = useIdleStore();
const {
  cookies,
  passiveUpgrades,
  activeUpgrades,
  cookiesPerSecond,
  clickMultiplier,
  specialUpgrades,
} = storeToRefs(idleStore);
const { click, load, save, wipe, tick } = idleStore;

let tickTimer = null;

function startTicking() {
  if (tickTimer) clearInterval(tickTimer);
  // Calculate interval based on special upgrade
  const base = 1000;
  const special = specialUpgrades.value.find(u => u.name === "Faster cooldown");
  const interval = special && special.owned > 0
    ? base / (special.multiplier ** special.owned)
    : base;
  tickTimer = setInterval(() => {
    tick();
    save();
  }, interval);
}

// CHEAT CODE FOR DEVELOPER MODE
let cheatBuffer = "";
function cheatListener(e) {
  cheatBuffer += e.key.toLowerCase();
  if (cheatBuffer.length > 10) cheatBuffer = cheatBuffer.slice(-10);
  if (cheatBuffer.includes("iddqd")) {
    //cookies.value += 1000;
    save();
    cheatBuffer = "";
  }
}


// Buy upgrade handlers
function buyPassiveUpgrade(idx) {
  const upgrade = passiveUpgrades.value[idx];
  if (cookies.value >= upgrade.cost) {
    cookies.value -= upgrade.cost;
    upgrade.owned += 1;
    upgrade.cost = Math.floor(upgrade.cost * 1.2);
    save();
  }
}

function planetClick() {
    click();
    save();
}

function buyActiveUpgrade(idx) {
  const upgrade = activeUpgrades.value[idx];
  if (cookies.value >= upgrade.cost) {
    cookies.value -= upgrade.cost;
    upgrade.owned += 1;
    upgrade.cost = Math.floor(upgrade.cost * 1.5);
    save();
  }
}

function buySpecialUpgrade(idx) {
  const upgrade = specialUpgrades.value[idx];
  if (cookies.value >= upgrade.cost) {
    cookies.value -= upgrade.cost;
    upgrade.owned += 1;
    upgrade.cost = Math.floor(upgrade.cost * 2);
    save();
    startTicking(); // Restart ticking with new interval
  }
}

onMounted(async () => {
    await load();
    startTicking();

    window.addEventListener("keydown", cheatListener);

});
</script>

<template>
  <div class="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-blue-900 to-black rounded-lg shadow-lg p-8">
    <h1 class="text-3xl font-bold mb-4 text-blue-200 drop-shadow">Idle Space Clicker</h1>
    <button 
    disabled
      @click="wipe"
      class="mb-4 px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
      aria-label="Wipe Progress"
    >
      Wipe Progress

    </button>
    <div class="mb-4 flex items-center gap-2">
        <label class="text-blue-200 font-semibold" for="enableWipe">Enable wipe</label>
        <input
            id="enableWipe"
            type="checkbox"
            v-model="wipeEnabled"
            class="form-checkbox h-5 w-5 text-red-600"
            @change="toggleWipe"
        />
    </div>
    <div class="mb-6 flex flex-col items-center">
      <button
        @click="planetClick"
        class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-900 hover:scale-105 shadow-2xl flex items-center justify-center text-6xl font-bold mb-2 border-4 border-blue-400 transition"
        aria-label="Planet"
      >
        🪐
      </button>
      <div class="text-lg font-semibold text-blue-100 mt-2">
        Stardust: <span class="text-yellow-300">{{ cookies }}</span>
      </div>
      <div class="text-sm text-blue-300">
        Stardust/tick: <span class="text-green-300">{{ cookiesPerSecond }}</span>
      </div>
      <div class="text-sm text-blue-300">
        Tick interval: <span class="text-green">{{ specialUpgrades.find(u => u.name === "Faster cooldown")?.owned > 0 ? (1000 / (specialUpgrades.find(u => u.name === "Faster cooldown").multiplier ** specialUpgrades.find(u => u.name === "Faster cooldown").owned)).toFixed(2) : 1000 }}</span> ms
      </div>
      <div class="text-sm text-blue-300">
        Cookies per clicks: <span class="text-green-300">{{ clickMultiplier }}</span>
      </div>
    </div>
    <div class="w-full max-w-3xl flex flex-col md:flex-row gap-6">
      <!-- Passive Upgrades -->
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2 text-purple-200">Passive Upgrades</h2>
        <ul>
          <li
            v-for="(upgrade, idx) in passiveUpgrades"
            :key="upgrade.name"
            class="flex items-center justify-between bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 rounded p-3 mb-2 shadow"
          >
            <div>
              <span class="text-2xl mr-2">{{ upgrade.emoji }}</span>
              <span class="font-semibold text-blue-100">{{ upgrade.name }}</span>
              <span class="ml-2 text-sm text-blue-300">({{ upgrade.cps }} stardust/sec)</span>
              <span class="ml-2 text-sm text-blue-400">Owned: {{ upgrade.owned }}</span>
            </div>
            <button
              @click="buyPassiveUpgrade(idx)"
              :disabled="cookies < upgrade.cost"
              class="ml-4 px-4 py-2 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Buy ({{ upgrade.cost }})
            </button>
          </li>
        </ul>
      </div>
      <!-- Active Upgrades -->
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2 text-purple-200">Active Upgrades</h2>
        <ul>
          <li
            v-for="(upgrade, idx) in activeUpgrades"
            :key="upgrade.name"
            class="flex items-center justify-between bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 rounded p-3 mb-2 shadow"
          >
            <div>
              <span class="text-2xl mr-2">{{ upgrade.emoji }}</span>
              <span class="font-semibold text-blue-100">{{ upgrade.name }}</span>
              <span
                class="ml-2 text-sm text-blue-300"
                v-if="upgrade.multiplier === 1"
              >
                (+{{ upgrade.additionner }} click power)
              </span>
              <span
                class="ml-2 text-sm text-blue-300"
                v-else
              >
                (x{{ upgrade.multiplier }} click power)
              </span>
              <span class="ml-2 text-sm text-blue-400">Owned: {{ upgrade.owned }}</span>
            </div>
            <button
              @click="buyActiveUpgrade(idx)"
              :disabled="cookies < upgrade.cost"
              class="ml-4 px-4 py-2 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Buy ({{ upgrade.cost }})
            </button>
          </li>
        </ul>
      </div>
      <!-- Special Upgrades -->
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2 text-purple-200">Special Upgrades</h2>
        <ul>
          <li
            v-for="(upgrade, idx) in specialUpgrades"
            :key="upgrade.name"
            class="flex items-center justify-between bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 rounded p-3 mb-2 shadow"
          >
            <div>
              <span class="text-2xl mr-2">{{ upgrade.emoji }}</span>
              <span class="font-semibold text-blue-100">{{ upgrade.name }}</span>
              <span class="ml-2 text-sm text-blue-400">Owned: {{ upgrade.owned }}</span>
            </div>
            <button
              @click="buySpecialUpgrade(idx)"
              :disabled="cookies < upgrade.cost"
              class="ml-4 px-4 py-2 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Buy ({{ upgrade.cost }})
            </button>
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>