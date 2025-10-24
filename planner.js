
const characters = {
    Ryu:  { name: 'Ryu',  csv: 'ryu.csv' },
    Nina: { name: 'Nina', csv: 'nina.csv' },
    Momo: { name: 'Momo', csv: 'momo.csv' }
};


const gainsCache = {};

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

async function calculateStats() {

    const levelInput = document.getElementById('level');

    const selectedChar = getSelectedChar();
    const level = parseInt(levelInput.value);

    if (!selectedChar) {
        alert('Please select a character.');
        return;
    }

    if (isNaN(level) || level < 1 || level > 99) {
        alert('Please enter a valid level between 1 and 99.');
        return;
    }

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
        
        // Update display
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

    const tabs = document.querySelectorAll('.char-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            calculateStats();
        });
    });

    calculateStats();

    const levelEl = document.getElementById('level');
    if (levelEl) levelEl.addEventListener('input', calculateStats);
});

