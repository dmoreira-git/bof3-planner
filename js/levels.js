window.setLevelMinForChar = function(charId) {
    const levelEl = document.getElementById('level');
    if (!levelEl) return;
    const charData = window.characters[charId];
    const min = (charData && Number.isInteger(charData.minLevel)) ? charData.minLevel : 1;
    levelEl.min = String(min);
    const saved = window.savedLevels[charId];
    const desired = (typeof saved === 'number') ? saved : min;
    const clamped = Math.max(min, Math.min(99, desired));
    levelEl.value = String(clamped);
    window.savedLevels[charId] = clamped;
};
window.saveCurrentLevelForChar = function() {
    const active = (document.querySelector('.char-tab.active') || {}).dataset?.char;
    if (!active) return;
    const levelEl = document.getElementById('level');
    if (!levelEl) return;
    const parsed = parseInt(levelEl.value || '0', 10);
    if (isNaN(parsed)) return;
    const charData = window.characters[active];
    const min = (charData && Number.isInteger(charData.minLevel)) ? charData.minLevel : 1;
    const clamped = Math.max(min, Math.min(99, parsed));
    window.savedLevels[active] = clamped;
};
window.parseAndValidateLevel = function(levelInput, selectedChar) {
    const raw = (levelInput?.value ?? '').trim();
    if (raw === '') return { raw, parsed: null, minLevel: 1, isNumber: false, inRange: false };
    if (!/^\d+$/.test(raw)) return { raw, parsed: null, minLevel: 1, isNumber: false, inRange: false };
    const parsed = parseInt(raw, 10);
    const charData = window.characters[selectedChar];
    const minLevel = (charData && Number.isInteger(charData.minLevel)) ? charData.minLevel : 1;
    const inRange = parsed >= minLevel && parsed <= 99;
    return { raw, parsed, minLevel, isNumber: true, inRange };
};