import { ref, computed } from "vue";
import { defineStore } from "pinia";

// Initial upgrades definition for reset/wipe
const INITIAL_PASSIVE_UPGRADES = [
    { name: "Moon Base", cost: 50, cps: 1, owned: 0, emoji: "🌙" },
    { name: "Mars Colony", cost: 250, cps: 5, owned: 0, emoji: "🪐" },
    { name: "Space Station", cost: 1000, cps: 20, owned: 0, emoji: "🚀" },
    { name: "Alien Tech", cost: 5000, cps: 100, owned: 0, emoji: "👽" },
    { name: "Galactic Empire", cost: 20000, cps: 500, owned: 0, emoji: "👑" },
    { name: "Stellar Network", cost: 100000, cps: 2000, owned: 0, emoji: "🌌" },
    { name: "Cosmic Anomaly", cost: 500000, cps: 10000, owned: 0, emoji: "🌠" },
    { name: "Quantum Singularity", cost: 2500000, cps: 50000, owned: 0, emoji: "⚛️" },
];

const INITIAL_ACTIVE_UPGRADES = [
    { name: "Click Multiplier", cost: 100, multiplier: 1, additionner:1, owned: 0, emoji: "🖱️" },
    { name: "Quantum Click", cost: 300000, multiplier: 1.5, owned: 0, emoji: "⚡" },    
    { name: "Nano Click", cost: 2660000, multiplier: 1, additionner: 10, owned: 0, emoji: "🔬" }, // Example additive upgrade
];

const INITIAL_SPECIAL_UPGRADES = [
    { name: "Faster cooldown", cost: 1000, multiplier: 1.2, owned: 0, emoji: "⏱️", type:"timer"},

]


const BASE_TICK_INTERVAL = 1000; // ms


// Universal storage for Electron or browser
const idleStorage = {
    async get() {
        if (window.electronAPI) {
            const data = await window.electronAPI.getIdleData();
            try { return JSON.parse(data); } catch { return data; }
        }
        const data = localStorage.getItem("idleGame");
        try { return JSON.parse(data); } catch { return data; }
    },
    async set(value) {
        const json = JSON.stringify(value);
        if (window.electronAPI && window.electronAPI.saveIdleData) {
            await window.electronAPI.saveIdleData(json);
        } else {
            localStorage.setItem("idleGame", json);
        }
    }
};

export const useIdleStore = defineStore("idleGame", () => {
    const cookies = ref(0);

    // Passive upgrades (cps)
    const passiveUpgrades = ref(INITIAL_PASSIVE_UPGRADES.map(u => ({ ...u })));

    // Active upgrades (click multiplier)
    const activeUpgrades = ref(INITIAL_ACTIVE_UPGRADES.map(u => ({ ...u })));

    // Special upgrades (e.g. faster cooldown)
    const specialUpgrades = ref(INITIAL_SPECIAL_UPGRADES.map(u => ({ ...u })));

    // Total cookies per second from passive upgrades
    const cookiesPerSecond = computed(() =>
        passiveUpgrades.value.reduce((sum, u) => sum + u.cps * u.owned, 0)
    );

    // Total click multiplier from active upgrades
    const clickMultiplier = computed(() => {
        // Multiplicative part
        const mult = activeUpgrades.value.reduce(
            (mul, u) => mul * (u.owned > 0 ? u.multiplier ** u.owned : 1),
            1
        );
        // Additive part
        const add = activeUpgrades.value.reduce(
            (sum, u) => sum + (u.owned > 0 && u.additionner ? u.additionner * u.owned : 0),
            0
        );
        return mult + add;
    });

    // -- Special Upgrades --

    // Special tick interval
    const tickIntervalMs = computed(() => {
        const upgrade = specialUpgrades.value[0];
        if (upgrade && upgrade.owned > 0) {
            return BASE_TICK_INTERVAL / (upgrade.multiplier ** upgrade.owned);
        }
        return BASE_TICK_INTERVAL;
    });

    let tickTimer = null;

    function startTicking() {
        if (tickTimer) clearInterval(tickTimer);
        tickTimer = setInterval(() => {
            tick();
            save();
        }, tickIntervalMs.value);
    }

    // Click handler
    function click() {
        cookies.value += clickMultiplier.value;
    }

    function tick() {
        cookies.value += cookiesPerSecond.value;
    }

        // --- Upgrade purchase handlers ---
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

    async function load() {
        const data = await idleStorage.get();
        if (data) {
            cookies.value = data.cookies ?? 0;

            // Restore passive upgrades
            if (Array.isArray(data.passiveUpgrades)) {
                passiveUpgrades.value.forEach((upgrade, i) => {
                    const saved = data.passiveUpgrades[i];
                    if (saved) {
                        upgrade.owned = saved.owned ?? 0;
                        upgrade.cost = saved.cost ?? INITIAL_PASSIVE_UPGRADES[i].cost;
                    } else {
                        upgrade.owned = 0;
                        upgrade.cost = INITIAL_PASSIVE_UPGRADES[i].cost;
                    }
                });
            } else {
                passiveUpgrades.value.forEach((upgrade, i) => {
                    upgrade.owned = 0;
                    upgrade.cost = INITIAL_PASSIVE_UPGRADES[i].cost;
                });
            }

            // Restore active upgrades
            if (Array.isArray(data.activeUpgrades)) {
                activeUpgrades.value.forEach((upgrade, i) => {
                    const saved = data.activeUpgrades[i];
                    if (saved) {
                        upgrade.owned = saved.owned ?? 0;
                        upgrade.cost = saved.cost ?? INITIAL_ACTIVE_UPGRADES[i].cost;
                    } else {
                        upgrade.owned = 0;
                        upgrade.cost = INITIAL_ACTIVE_UPGRADES[i].cost;
                    }
                });
            } else {
                activeUpgrades.value.forEach((upgrade, i) => {
                    upgrade.owned = 0;
                    upgrade.cost = INITIAL_ACTIVE_UPGRADES[i].cost;
                });
            }

                    if (data) {
            cookies.value = data.cookies ?? 0;
            // ...restore passive/active upgrades as before...
            // Restore special upgrades
            if (Array.isArray(data.specialUpgrades)) {
                specialUpgrades.value.forEach((upgrade, i) => {
                    const saved = data.specialUpgrades[i];
                    if (saved) {
                        upgrade.owned = saved.owned ?? 0;
                        upgrade.cost = saved.cost ?? INITIAL_SPECIAL_UPGRADES[i].cost;
                    } else {
                        upgrade.owned = 0;
                        upgrade.cost = INITIAL_SPECIAL_UPGRADES[i].cost;
                    }
                });
            } else {
                specialUpgrades.value.forEach((upgrade, i) => {
                    upgrade.owned = 0;
                    upgrade.cost = INITIAL_SPECIAL_UPGRADES[i].cost;
                });
            }
        }
        startTicking()
            
        }
    }

    async function save() {
        await idleStorage.set({
            cookies: cookies.value,
            passiveUpgrades: passiveUpgrades.value.map(u => ({
                name: u.name,
                cost: u.cost,
                cps: u.cps,
                owned: u.owned,
                emoji: u.emoji,
            })),
            activeUpgrades: activeUpgrades.value.map(u => ({
                name: u.name,
                cost: u.cost,
                multiplier: u.multiplier,
                owned: u.owned,
                emoji: u.emoji,
            })),
            specialUpgrades: specialUpgrades.value.map(u => ({
                name: u.name,
                cost: u.cost,
                multiplier: u.multiplier,
                owned: u.owned,
                emoji: u.emoji,
            })),
        });
    }

    async function wipe() {
        cookies.value = 0;
        passiveUpgrades.value.forEach((upgrade, i) => {
            upgrade.owned = 0;
            upgrade.cost = INITIAL_PASSIVE_UPGRADES[i].cost;
        });
        activeUpgrades.value.forEach((upgrade, i) => {
            upgrade.owned = 0;
            upgrade.cost = INITIAL_ACTIVE_UPGRADES[i].cost;
        });
        specialUpgrades.value.forEach((upgrade, i) => {
            upgrade.owned = 0;
            upgrade.cost = INITIAL_SPECIAL_UPGRADES[i].cost;
        });
        if (window.electronAPI) {
            await window.electronAPI.saveIdleData(JSON.stringify({}));
        } else {
            localStorage.removeItem("idleGame");
        }
        await save();
        await load();
        location.reload();
    }

    // Call this periodically (e.g. with setInterval) to add passive cookies
    function tick() {
        cookies.value += cookiesPerSecond.value;
    }

    return {
        cookies,
        passiveUpgrades,
        activeUpgrades,
        specialUpgrades,
        cookiesPerSecond,
        clickMultiplier,
        click,
        load,
        save,
        wipe,
        tick,
        buySpecialUpgrade,
        tickIntervalMs,
        startTicking,
    };
});