const characters = {
    Ryu:  { name: 'Ryu',  csv: 'ryu.csv',  minLevel: 1 },
    Nina: { name: 'Nina', csv: 'nina.csv', minLevel: 5 },
    Momo: { name: 'Momo', csv: 'momo.csv', minLevel: 10 },
    Rei:  { name: 'Rei',  csv: 'rei.csv',  minLevel: 5 },
    Peco: { name: 'Peco', csv: 'peco.csv', minLevel: 1 },
    Garr :{ name: 'Garr', csv: 'garr.csv', minLevel: 13 } // example different minimum
};

const gainsCache = {};
const savedLevels = {};

function clampLevel(v) {
    if (!Number.isInteger(v)) return v;
    return Math.max(1, Math.min(99, v));
}

async function loadGains(charId) {
    if (gainsCache[charId]) {
        return gainsCache[charId];
    }

    const charData = characters[charId];
    if (!charData) {
        throw new Error(`Unknown character id "${charId}". Valid ids: ${Object.keys(characters).join(', ')}`);
    }
    const response = await fetch(charData.csv);
    if (!response.ok) {
        throw new Error(`Failed to load ${charData.csv}`);
    }
    const text = await response.text();
    const lines = text.trim().split('\n');
    const gains = lines.map(line => {
        const values = line.split(',').map(val => parseFloat(val.trim()));
        if (values.length !== 6 || values.some(isNaN)) {
            throw new Error(`Invalid data in ${charData.csv}`);
        }
        return values;
    });

    if (gains.length !== 99) {
        throw new Error(`${charData.csv} does not have exactly 99 lines`);
    }

    gainsCache[charId] = gains;
    return gains;
}

function getSelectedChar() {
    const active = document.querySelector('.char-tab.active');
    return active ? active.dataset.char : null;
}

function setLevelMinForChar(charId) {
    const levelEl = document.getElementById('level');
    if (!levelEl) return;
    const charData = characters[charId];
    const min = (charData && Number.isInteger(charData.minLevel)) ? charData.minLevel : 1;
    levelEl.min = String(min);

    const saved = savedLevels[charId];
    const desired = (typeof saved === 'number') ? saved : min;


    const clamped = Math.max(min, Math.min(99, desired));
    levelEl.value = String(clamped);

    
    savedLevels[charId] = clamped;
}

function saveCurrentLevelForChar() {
    const currentChar = getSelectedChar();
    if (!currentChar) return;
    const levelEl = document.getElementById('level');
    if (!levelEl) return;
    const parsed = parseInt(levelEl.value || '0', 10);
    if (isNaN(parsed)) return;
    const charData = characters[currentChar];
    const min = (charData && Number.isInteger(charData.minLevel)) ? charData.minLevel : 1;
    const clamped = Math.max(min, Math.min(99, parsed));
    savedLevels[currentChar] = clamped;
}

async function calculateStats() {

    const levelInput = document.getElementById('level');

    const selectedChar = getSelectedChar();
    const level = parseInt(levelInput.value, 10);

    if (!selectedChar) {
        alert('Please select a character.');
        return;
    }

    const charData = characters[selectedChar];
    const minLevel = (charData && Number.isInteger(charData.minLevel)) ? charData.minLevel : 1;

    if (isNaN(level) || level < minLevel || level > 99) {
        alert(`Please enter a valid level between ${minLevel} and 99.`);
        return;
    }


    savedLevels[selectedChar] = level;

    try {
        const gains = await loadGains(selectedChar);
        const stats = {hp:0, ap:0, pwr:0, def:0, agl:0, int:0};
        for (let i = 0; i < level; i++) {
            stats.hp += gains[i][0];
            stats.ap += gains[i][1];
            stats.pwr += gains[i][2];
            stats.def += gains[i][3];
            stats.agl += gains[i][4];
            stats.int += gains[i][5];
        }

        document.getElementById('charName').textContent = characters[selectedChar].name;
        document.getElementById('charLevel').textContent = level;
        document.getElementById('HP').textContent = stats.hp;
        document.getElementById('AP').textContent = stats.ap;
        document.getElementById('PWR').textContent = stats.pwr;
        document.getElementById('DEF').textContent = stats.def;
        document.getElementById('AGL').textContent = stats.agl;
        document.getElementById('INT').textContent = stats.int;
        
        document.getElementById('result').classList.remove('hidden');
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}


window.addEventListener('DOMContentLoaded', () => {


    Object.keys(characters).forEach(id => {
        const m = characters[id] && Number.isInteger(characters[id].minLevel) ? characters[id].minLevel : 1;
        savedLevels[id] = m;
    });

    const tabs = document.querySelectorAll('.char-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {

            const prev = getSelectedChar();
            if (prev) saveCurrentLevelForChar();

            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            setLevelMinForChar(tab.dataset.char);

            calculateStats();
        });
    });

    const activeChar = getSelectedChar();
    if (activeChar) setLevelMinForChar(activeChar);

    const levelEl = document.getElementById('level');
    if (levelEl) {
        levelEl.addEventListener('input', () => {
            saveCurrentLevelForChar();
            calculateStats();
        });
    }

    calculateStats();
});

