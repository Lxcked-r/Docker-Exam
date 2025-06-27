<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useIdleClickerV2Store } from "@/stores/idleClickerV2Store";
const store = useIdleClickerV2Store();

onMounted(() => {
  store.load();
  store.startTicking();
  window.addEventListener("keydown", store.cheatListener);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", store.cheatListener);
});
</script>

<template>
  <div class="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-blue-900 to-black rounded-lg shadow-lg p-8">
    <h1 class="text-4xl font-bold mb-4 text-blue-200 drop-shadow">Idle Space Clicker v2 🚀</h1>
    <div class="mb-2 text-blue-100 text-center max-w-2xl">
      <p>
        <b>How to play:</b> Click the planet to earn Stardust. Buy upgrades to increase your Stardust per second and per click. Prestige to reset for a permanent multiplier. Unlock <b>Special Prestiges</b> for powerful permanent effects!
      </p>
    </div>
    <div class="flex flex-row gap-6 mb-4">
      <div class="flex flex-col items-center">
        <span class="text-yellow-300 text-2xl font-bold">{{ store.cookies }}</span>
        <span class="text-blue-100 text-xs">Stardust</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-green-300 text-2xl font-bold">{{ store.cookiesPerSecond }}</span>
        <span class="text-blue-100 text-xs">Stardust/sec</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-pink-300 text-2xl font-bold">{{ store.clickPower }}</span>
        <span class="text-blue-100 text-xs">Per Click</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-orange-300 text-2xl font-bold">{{ store.prestigePoints }}</span>
        <span class="text-blue-100 text-xs">Prestige</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-orange-200 text-2xl font-bold">x{{ store.prestigeMultiplier }}</span>
        <span class="text-blue-100 text-xs">Prestige Multiplier</span>
      </div>
    </div>

    <button
      @click="store.wipe"
      class="mb-4 px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
      aria-label="Wipe Progress"

      >
      wipe
    </button>
    <div class="mb-6 flex flex-col items-center">
      <button
        @click="store.clickPlanet"
        class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-900 hover:scale-105 shadow-2xl flex items-center justify-center text-7xl font-bold mb-2 border-4 border-blue-400 transition"
        aria-label="Planet"
      >
        🪐
      </button>
      <div class="w-64 h-4 bg-gray-800 rounded-full overflow-hidden mt-2 mb-2">
        <div
          class="h-full bg-yellow-400 transition-all"
          :style="{ width: Math.min((store.cookies / 100000000000000) * 100, 100) + '%' }"
        ></div>
      </div>
      <div class="text-sm text-blue-300">
        Tick interval: <span class="text-green">{{ store.tickInterval.toFixed(2) }}</span> ms
      </div>
    </div>

    <div class="w-full max-w-5xl flex flex-col md:flex-row gap-6">
      <!-- Passive Upgrades -->
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2 text-purple-200">Passive Upgrades</h2>
        <ul>
          <li
            v-for="(upgrade, idx) in store.visibleUpgrades(store.passiveUpgrades)"
            :key="upgrade.name"
            class="flex items-center justify-between bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 rounded p-3 mb-2 shadow group"
          >
            <div>
              <span class="text-2xl mr-2">{{ upgrade.emoji }}</span>
              <span class="font-semibold text-blue-100">{{ upgrade.name }}</span>
              <span class="ml-2 text-sm text-blue-300">({{ upgrade.cps }} stardust/sec)</span>
              <span class="ml-2 text-sm text-blue-400">Owned: {{ upgrade.owned }}</span>
            </div>
            <button
              @click="store.buyPassiveUpgrade(idx)"
              :disabled="store.cookies < store.getUpgradeCost(upgrade.cost)"
              class="ml-4 px-4 py-2 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition group-hover:scale-105"
              :title="'Cost: ' + store.getUpgradeCost(upgrade.cost)"
            >
              Buy ({{ store.getUpgradeCost(upgrade.cost) }})
            </button>
          </li>
        </ul>
      </div>
      <!-- Active Upgrades -->
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2 text-purple-200">Active Upgrades</h2>
        <ul>
          <li
            v-for="(upgrade, idx) in store.visibleUpgrades(store.activeUpgrades)"
            :key="upgrade.name"
            class="flex items-center justify-between bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 rounded p-3 mb-2 shadow group"
          >
            <div>
              <span class="text-2xl mr-2">{{ upgrade.emoji }}</span>
              <span class="font-semibold text-blue-100">{{ upgrade.name }}</span>
              <span
                class="ml-2 text-sm text-blue-300"
                v-if="upgrade.additionner"
              >
                (+{{ upgrade.additionner }} click power)
              </span>
              <span
                class="ml-2 text-sm text-blue-300"
                v-if="upgrade.multiplier"
              >
                (x{{ upgrade.multiplier }} click power)
              </span>
              <span class="ml-2 text-sm text-blue-400">Owned: {{ upgrade.owned }}</span>
            </div>
            <button
              @click="store.buyActiveUpgrade(idx)"
              :disabled="store.cookies < store.getUpgradeCost(upgrade.cost)"
              class="ml-4 px-4 py-2 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition group-hover:scale-105"
              :title="'Cost: ' + store.getUpgradeCost(upgrade.cost)"
            >
              Buy ({{ store.getUpgradeCost(upgrade.cost) }})
            </button>
          </li>
        </ul>
      </div>
      <!-- Special Upgrades -->
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2 text-purple-200">Special Upgrades</h2>
        <ul>
          <li
            v-for="(upgrade, idx) in store.specialUpgrades"
            :key="upgrade.name"
            class="flex items-center justify-between bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 rounded p-3 mb-2 shadow group"
          >
            <div>
              <span class="text-2xl mr-2">{{ upgrade.emoji }}</span>
              <span class="font-semibold text-blue-100">{{ upgrade.name }}</span>
              <span class="ml-2 text-sm text-blue-400">Owned: {{ upgrade.owned }}</span>
            </div>
            <button
              @click="store.buySpecialUpgrade(idx)"
              :disabled="store.cookies < store.getUpgradeCost(upgrade.cost)"
              class="ml-4 px-4 py-2 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition group-hover:scale-105"
              :title="'Cost: ' + store.getUpgradeCost(upgrade.cost)"
            >
              Buy ({{ store.getUpgradeCost(upgrade.cost) }})
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Special Prestige Section -->
    <div class="mt-8 flex flex-col items-center">
      <h2 class="text-2xl font-bold text-orange-300 mb-2">Special Prestiges</h2>
      <div class="flex flex-row gap-4">
        <div
          v-for="(p, idx) in store.specialPrestiges"
          :key="p.name"
          class="flex flex-col items-center"
        >
          <button
            :disabled="p.owned || store.prestigePoints < 3"
            @click="store.buySpecialPrestige(idx)"
            class="rounded-full border-4 border-yellow-400 bg-gray-900 hover:scale-105 transition disabled:opacity-50"
            style="width:80px;height:80px;overflow:hidden"
            :title="p.description"
          >
              <img :src="store.getPrestigeImg(p.img)" /></button>
          <span class="text-xs text-blue-100 mt-1">{{ p.name }}</span>
          <span v-if="p.owned" class="text-green-400 text-xs font-bold">Owned</span>
        </div>
      </div>
      <div class="text-blue-100 mt-2 text-xs">
        Each special prestige requires 3 prestige points and resets your progress, but grants a permanent effect!
      </div>
    </div>

    <!-- Prestige Section -->
    <div class="mt-8 flex flex-col items-center">
      <h2 class="text-2xl font-bold text-orange-300 mb-2">Prestige</h2>
      <div class="text-blue-100 mb-2">
        Reset your progress for a permanent <span class="text-orange-200 font-bold">x{{ store.prestigeMultiplier }}</span> stardust gain!
      </div>
      <button
        @click="store.doPrestige"
        :disabled="!store.canPrestige()"
        class="px-6 py-3 rounded bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold hover:scale-105 transition disabled:opacity-50"
      >
        Prestige (requires 100'000'000'000'000 stardust)
      </button>
    </div>
  </div>
</template>