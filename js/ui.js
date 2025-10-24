window.getSelectedChar = function() {
    const active = document.querySelector('.char-tab.active');
    return active ? active.dataset.char : null;
};
window.calculateStats = async function({ suppressAlerts = false } = {}) {
    const levelInput = document.getElementById('level');
    if (!levelInput) return;
    const selectedChar = window.getSelectedChar();
    if (!selectedChar) {
        if (!suppressAlerts) alert('Please select a character.');
        return;
    }
    const { raw, parsed, minLevel, isNumber, inRange } = window.parseAndValidateLevel(levelInput, selectedChar);
    if (!isNumber || !inRange) {
        if (!suppressAlerts) {
            if (!isNumber) {
                alert('Please enter a numeric level.');
            } else {
                alert(`Please enter a valid level between ${minLevel} and 99.`);
            }
        }
        return;
    }
    window.savedLevels[selectedChar] = parsed;
    try {
        const gains = await window.loadGains(selectedChar);
        const stats = {hp:0, ap:0, pwr:0, def:0, agl:0, int:0};
        for (let i = 0; i < parsed; i++) {
            stats.hp += gains[i][0];
            stats.ap += gains[i][1];
            stats.pwr += gains[i][2];
            stats.def += gains[i][3];
            stats.agl += gains[i][4];
            stats.int += gains[i][5];
        }
        document.getElementById('charName').textContent = window.characters[selectedChar].name;
        document.getElementById('charLevel').textContent = parsed;
        const imgEl = document.getElementById('charImg');
        if (imgEl) {
            imgEl.src = window.characters[selectedChar].img || '';
            imgEl.alt = window.characters[selectedChar].name || '';
        }
        document.getElementById('HP').textContent = stats.hp;
        document.getElementById('AP').textContent = stats.ap;
        document.getElementById('PWR').textContent = stats.pwr;
        document.getElementById('DEF').textContent = stats.def;
        document.getElementById('AGL').textContent = stats.agl;
        document.getElementById('INT').textContent = stats.int;
        document.getElementById('result').classList.remove('hidden');
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
};
window.addEventListener('DOMContentLoaded', () => {
    window.initSavedLevels();
    const tabs = document.querySelectorAll('.char-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const prev = window.getSelectedChar();
            if (prev) window.saveCurrentLevelForChar();
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            window.setLevelMinForChar(tab.dataset.char);
            window.calculateStats();
        });
    });
    const activeChar = window.getSelectedChar();
    if (activeChar) window.setLevelMinForChar(activeChar);
    const levelEl = document.getElementById('level');
    if (levelEl) {
        levelEl.addEventListener('input', () => {
            window.calculateStats({ suppressAlerts: true });
        });
        levelEl.addEventListener('blur', () => {
            window.calculateStats();
        });
        levelEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') window.calculateStats();
        });
    }
    window.calculateStats();
});