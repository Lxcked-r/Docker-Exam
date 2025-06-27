import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useIdleClickerV2Store = defineStore("idleClickerV2", () => {
  // State
  const cookies = ref(0);
  const prestigePoints = ref(0);

  // Upgrades
  const passiveUpgrades = ref([
    { name: "Moon Base", cost: 50, cps: 1, owned: 0, emoji: "🌙" },
    { name: "Mars Colony", cost: 250, cps: 5, owned: 0, emoji: "🪐" },
    { name: "Space Station", cost: 1000, cps: 20, owned: 0, emoji: "🚀" },
    { name: "Alien Tech", cost: 5000, cps: 100, owned: 0, emoji: "👽" },
    { name: "Discover a jump point", cost: 20000, cps: 500, owned: 0, emoji: "🛸" },
    { name: "Galactic Empire", cost: 100000, cps: 2000, owned: 0, emoji: "👑" },
    { name: "Stellar Network", cost: 500000, cps: 10000, owned: 0, emoji: "🌌" },
    { name: "Cosmic Anomaly", cost: 2500000, cps: 50000, owned: 0, emoji: "🌠" },
    { name: "Quantum Singularity", cost: 10000000, cps: 250000, owned: 0, emoji: "⚛️" },
    { name: "Intergalactic Federation", cost: 50000000, cps: 1000000, owned: 0, emoji: "🌐" },
    { name: "Multiverse Portal", cost: 250000000, cps: 5000000, owned: 0, emoji: "🌌" },
    { name: "Time Dilation", cost: 1000000000, cps: 25000000, owned: 0, emoji: "⏳" },
  ]);
  const activeUpgrades = ref([
    { name: "Click Multiplier", cost: 100, multiplier: 1.3, owned: 0, emoji: "🖱️" },
    { name: "Nano Click", cost: 5000, additionner: 10, owned: 0, emoji: "🔬" },
    { name: "Quantum Click", cost: 20000, multiplier: 3, owned: 0, emoji: "⚡" },
    { name: "Dark Matter Click", cost: 100000, multiplier: 1.4, owned: 0, emoji: "🌑" },
    { name: "Stellar Burst", cost: 500000, multiplier: 1.5, owned: 0, emoji: "🌟" },
    { name: "Cosmic Ray Click", cost: 2500000, multiplier: 1.7, owned: 0, emoji: "☄️" },
    { name: "Galactic Nova", cost: 10000000, multiplier: 2, owned: 0, emoji: "💥" },
  ]);
  const specialUpgrades = ref([
    { name: "Faster cooldown", cost: 1000, multiplier: 1.2, owned: 0, emoji: "⏱️" },
    { name: "Cookie Magnet", cost: 5000, multiplier: 1.5, owned: 0, emoji: "🧲" },
    { name: "Galactic Boost", cost: 20000, multiplier: 2, owned: 0, emoji: "🚀" },
    { name: "Quantum Leap", cost: 100000, multiplier: 3, owned: 0, emoji: "⚛️" },
    { name: "Cosmic Harmony", cost: 500000, multiplier: 5, owned: 0, emoji: "🌌" },
    { name: "Stellar Convergence", cost: 2500000, multiplier: 10, owned: 0, emoji: "🌠" },
  ]);

  // Special Prestiges
  const specialPrestiges = ref([
    {
      name: "The coin guy",
      description: "All upgrade costs are halved forever.",
      img: "coin_guy.png",
      owned: false,
      effect: "halveCosts"
    },
    {
      name: "Patrick Balkany",
      description: "Every click gives double cookies forever.",
      img: "patoche.avif",
      owned: false,
      effect: "doubleClick"
    },
    {
      name: "Xavier du pont de Ligonnès",
      description: "Every prestige gives you 1 extra prestige point.",
      img: "xavier.jpg",
      owned: false,
      effect: "extraPrestige"
    },
    {
      name: "Mahieu",
      description: "unlock the possibility to critical click.",
      img: "mahieu.png",
      owned: false,
      effect: "criticalClick"
    },
    {
      name: "Eddy-Malou",
      description: "double effects of Mahieu.",
      img: "eddy-malou.jpg",
      owned: false,
      effect: "doubleMahieu"
    }
  ]);

  // Helpers for special prestige effects
  function hasSpecialPrestige(effect) {
    return !!specialPrestiges.value.find(p => p.effect === effect && p.owned);
  }

  // Computed
  const prestigeMultiplier = computed(() => 1 + prestigePoints.value * 0.5);

  const cookiesPerSecond = computed(() =>
    Math.floor(
      passiveUpgrades.value.reduce((sum, u) => sum + u.cps * u.owned, 0) * prestigeMultiplier.value
    )
  );

  // Helper to get image path for special prestiges
function getPrestigeImg(img) {
  // If running in Electron, use the assets folder directly
  if (window.electronAPI) {
    return `assets/${img}`;
  }
  // Otherwise, use public/assets for web
  return `/assets/${img}`;
}
const clickPower = computed(() => {
  let mult = activeUpgrades.value.reduce(
    (m, u) => m * (u.multiplier ? u.multiplier ** u.owned : 1), 1
  );
  let add = activeUpgrades.value.reduce(
    (a, u) => a + (u.additionner ? u.additionner * u.owned : 0), 0
  );
  let base = Math.floor((1 + add) * mult * prestigeMultiplier.value);
  if (hasSpecialPrestige("doubleClick")) base *= 2;

  // Mahieu: critical click chance
  if (hasSpecialPrestige("criticalClick")) {
    // Eddy-Malou: double Mahieu effect
    const critChance = hasSpecialPrestige("doubleMahieu") ? 0.2 : 0.1; // 20% or 10%
    const critMultiplier = hasSpecialPrestige("doubleMahieu") ? 4 : 2; // x4 or x2
    if (Math.random() < critChance) {
      // Optionally, you can expose a flag to the UI for "CRITICAL!"
      return base * critMultiplier;
    }
  }

  return base;
});

  const tickInterval = computed(() => {
    const special = specialUpgrades.value[0];
    return special.owned > 0 ? 20000 / (special.multiplier ** special.owned) : 20000;
  });

  // Unlock logic
  function visibleUpgrades(upgrades) {
    return upgrades.filter((u, i) => i === 0 || upgrades[i - 1].owned > 0);
  }

  // Cost calculation with special prestige
  function getUpgradeCost(baseCost) {
    return hasSpecialPrestige("halveCosts") ? Math.floor(baseCost / 2) : baseCost;
  }

  // Game logic
  let tickTimer = null;
  function startTicking() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      cookies.value += cookiesPerSecond.value;
      save();
    }, tickInterval.value);
  }

  function clickPlanet() {
    cookies.value += clickPower.value;
    save();
  }

  function buyPassiveUpgrade(idx) {
    const u = passiveUpgrades.value[idx];
    const realCost = getUpgradeCost(u.cost);
    if (cookies.value >= realCost) {
      cookies.value -= realCost;
      u.owned += 1;
      u.cost = Math.floor(u.cost * 1.2);
      save();
    }
  }

  function buyActiveUpgrade(idx) {
    const u = activeUpgrades.value[idx];
    const realCost = getUpgradeCost(u.cost);
    if (cookies.value >= realCost) {
      cookies.value -= realCost;
      u.owned += 1;
      u.cost = Math.floor(u.cost * (u.multiplier ? 1.5 : 1.3));
      save();
    }
  }

  function buySpecialUpgrade(idx) {
    const u = specialUpgrades.value[idx];
    const realCost = getUpgradeCost(u.cost);
    if (cookies.value >= realCost) {
      cookies.value -= realCost;
      u.owned += 1;
      u.cost = Math.floor(u.cost * 2);
      save();
      startTicking();
    }
  }

  function canPrestige() {
    return cookies.value >= 100000000000000;
  }

  function doPrestige() {
    if (!canPrestige()) return;
    // Check if Xavier du pont de Ligonnès special prestige is owned
    const extraPrestige = hasSpecialPrestige("extraPrestige") ? 1 : 0;
    prestigePoints.value += 1 + extraPrestige;
    cookies.value = 0;
    passiveUpgrades.value.forEach((u, i) => { u.owned = 0; u.cost = [50,250,1000,5000][i]; });
    activeUpgrades.value.forEach((u, i) => { u.owned = 0; u.cost = [100,5000,20000][i]; });
    specialUpgrades.value.forEach(u => { u.owned = 0; u.cost = 1000; });
    // Optionally, reset specialPrestiges here if you want them to be per-prestige
    // specialPrestiges.value.forEach(p => { p.owned = false; });
    save();
    startTicking();
  }

  // Special Prestige logic
  function buySpecialPrestige(idx) {
    const p = specialPrestiges.value[idx];
    if (p.owned) return;
    // Example: require 3 prestige points
    if (prestigePoints.value < 3) return;
    p.owned = true;
    // Reset game state as part of the effect
    cookies.value = 0;
    passiveUpgrades.value.forEach((u, i) => { u.owned = 0; u.cost = [50,250,1000,5000][i]; });
    activeUpgrades.value.forEach((u, i) => { u.owned = 0; u.cost = [100,5000,20000][i]; });
    specialUpgrades.value.forEach(u => { u.owned = 0; u.cost = 1000; });
    save();
    startTicking();
  }

  // Save/Load
  function save() {
    localStorage.setItem("idleClickerV2Save", JSON.stringify({
      cookies: cookies.value,
      prestigePoints: prestigePoints.value,
      passiveUpgrades: passiveUpgrades.value,
      activeUpgrades: activeUpgrades.value,
      specialUpgrades: specialUpgrades.value,
      specialPrestiges: specialPrestiges.value,
    }));
  }
  function load() {
    const data = JSON.parse(localStorage.getItem("idleClickerV2Save") || "null");
    if (!data) return;
    cookies.value = data.cookies ?? 0;
    prestigePoints.value = data.prestigePoints ?? 0;
    ["passiveUpgrades","activeUpgrades","specialUpgrades","specialPrestiges"].forEach(key => {
      if (Array.isArray(data[key])) {
        data[key].forEach((u, i) => {
          Object.assign(eval(key).value[i], u);
        });
      }
    });
  }

  // Cheat code
  let cheatBuffer = "";
  function cheatListener(e) {
    cheatBuffer += e.key.toLowerCase();
    if (cheatBuffer.length > 10) cheatBuffer = cheatBuffer.slice(-10);
    if (cheatBuffer.includes("iddqd")) {
      cookies.value += 1000;
      save();
      cheatBuffer = "";
    }
  }

  function wipe() {
  localStorage.removeItem("idleClickerV2Save");
  console.log("Game data wiped.");
  location.reload();
}


  return {
    // state
    cookies, prestigePoints, passiveUpgrades, activeUpgrades, specialUpgrades, specialPrestiges,
    // computed
    prestigeMultiplier, cookiesPerSecond, clickPower, tickInterval,
    // logic
    visibleUpgrades, startTicking, clickPlanet, buyPassiveUpgrade, buyActiveUpgrade, buySpecialUpgrade,
    canPrestige, doPrestige, save, load, cheatListener,
    hasSpecialPrestige, buySpecialPrestige, getUpgradeCost, wipe,

    // helpers
    getPrestigeImg,
  };
});