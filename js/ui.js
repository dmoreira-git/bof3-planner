window.getSelectedChar = function() {
    const active = document.querySelector('.char-tab.active');
    return active ? active.dataset.char : null;
};
window.savedMasterRows = {};
function createMasterLineElement(idx, data, mastersList) {
    const wrap = document.createElement('div');
    wrap.className = 'master-line';
    const cnt = document.createElement('input');
    cnt.type = 'number';
    cnt.className = 'master-count';
    cnt.step = '1';
    cnt.value = (data.count != null) ? data.count : (data.level != null ? data.level : '1');
    const sel = document.createElement('select');
    sel.className = 'master-select-line';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = '--NONE--';
    sel.appendChild(none);
    mastersList.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = (window.masters && window.masters[id] && window.masters[id].name) ? window.masters[id].name : id;
        if ((data.master || '') === id) opt.selected = true;
        sel.appendChild(opt);
    });
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-master';
    removeBtn.textContent = 'Remove';
    wrap.appendChild(cnt);
    wrap.appendChild(sel);
    wrap.appendChild(removeBtn);
    return {wrap, cnt, sel, removeBtn};
}
function renderMasterRowsForChar(charId) {
    const container = document.getElementById('masterRows');
    container.innerHTML = '';
    const mastersList = Object.keys(window.masters || {});
    if (!Array.isArray(window.savedMasterRows[charId])) window.savedMasterRows[charId] = [];
    const minBase = (window.characters[charId] && Number.isInteger(window.characters[charId].minLevel)) ? window.characters[charId].minLevel : 1;
    if (window.savedMasterRows[charId].length === 0) window.savedMasterRows[charId].push({ count: 1, master: '' });
    window.savedMasterRows[charId].forEach((row, i) => {
        if (row.count == null && row.level != null) row.count = row.level;
        if (row.count == null) row.count = 1;
        const {wrap, cnt, sel, removeBtn} = createMasterLineElement(i, row, mastersList);
        wrap.dataset.index = String(i);
        container.appendChild(wrap);
        cnt.addEventListener('input', () => {
            const v = parseInt(cnt.value||'',10);
            if (!isNaN(v)) window.savedMasterRows[charId][i].count = v;
            enforceRowConstraints(charId);
            calculateStats({ suppressAlerts: true });
        });
        cnt.addEventListener('blur', () => {
            enforceRowConstraints(charId);
            calculateStats();
        });
        sel.addEventListener('change', () => {
            window.savedMasterRows[charId][i].master = sel.value;
            calculateStats({ suppressAlerts: true });
        });
        removeBtn.addEventListener('click', () => {
            if (window.savedMasterRows[charId].length === 1) return;
            window.savedMasterRows[charId].splice(i,1);
            renderMasterRowsForChar(charId);
            calculateStats();
        });
    });
    enforceRowConstraints(charId);
}
function enforceRowConstraints(charId) {
    const rows = window.savedMasterRows[charId];
    if (!rows || rows.length === 0) return;
    const minBase = (window.characters[charId] && Number.isInteger(window.characters[charId].minLevel)) ? window.characters[charId].minLevel : 1;
    let used = 0;
    for (let i=0;i<rows.length;i++) {
        const el = document.querySelector(`#masterRows .master-line:nth-child(${i+1}) .master-count`);
        const remainingRows = rows.length - i - 1;
        const remainingMin = remainingRows * 1;
        const maxAvailable = Math.max(1, 99 - minBase - used - remainingMin);
        const minVal = 1;
        if (el) {
            el.min = String(minVal);
            el.max = String(maxAvailable);
            let v = parseInt(el.value||'',10);
            if (isNaN(v)) v = minVal;
            if (v < minVal) v = minVal;
            if (v > maxAvailable) v = maxAvailable;
            el.value = String(v);
            rows[i].count = v;
            used += v;
        } else {
            rows[i].count = Math.max(1, Math.min(maxAvailable, Number(rows[i].count||1)));
            used += rows[i].count;
        }
    }
    window.savedMasterRows[charId] = rows;
}
function masterForLevel(lvl, rows, minBase) {
    let cum = 0;
    for (let i = 0; i < rows.length; i++) {
        const start = minBase + cum + 1;
        const end = minBase + cum + rows[i].count;
        if (lvl >= start && lvl <= end) return rows[i].master || '';
        cum += rows[i].count;
    }
    return '';
}
function totalLevelsFromRows(rows, minBase) {
    const sum = (rows || []).reduce((s,r) => s + (Number(r.count||0)), 0);
    return minBase + sum;
}
window.calculateStats = async function({ suppressAlerts = false } = {}) {
    if (window.mastersLoadedPromise) await window.mastersLoadedPromise;
    const selectedChar = window.getSelectedChar();
    if (!selectedChar) {
        if (!suppressAlerts) alert('Please select a character.');
        return;
    }
    if (!Array.isArray(window.savedMasterRows[selectedChar])) window.savedMasterRows[selectedChar] = [];
    const rows = window.savedMasterRows[selectedChar];
    const minBase = (window.characters[selectedChar] && Number.isInteger(window.characters[selectedChar].minLevel)) ? window.characters[selectedChar].minLevel : 1;
    if (rows.length) {
        const counts = rows.map(r => parseInt(r.count||0,10)).filter(v => !isNaN(v));
        if (counts.length !== rows.length) {
            if (!suppressAlerts) alert('Please enter numeric counts.');
            return;
        }
        for (let i=0;i<rows.length;i++) {
            if (rows[i].count < 1) {
                if (!suppressAlerts) alert('Each row must have at least 1 level.');
                return;
            }
        }
    }
    const finalLevel = totalLevelsFromRows(rows, minBase);
    if (finalLevel > 99) {
        if (!suppressAlerts) alert('Total level cannot exceed 99.');
        return;
    }
    try {
        const gains = await window.loadGains(selectedChar);
        const stats = {HP:0, AP:0, PWR:0, DEF:0, AGL:0, INT:0};
        for (let lvl = minBase; lvl <= finalLevel; lvl++) {
            const baseRow = gains[lvl-1] || [0,0,0,0,0,0];
            const baseHP = Number(baseRow[0]||0);
            const baseAP = Number(baseRow[1]||0);
            const basePWR = Number(baseRow[2]||0);
            const baseDEF = Number(baseRow[3]||0);
            const baseAGL = Number(baseRow[4]||0);
            const baseINT = Number(baseRow[5]||0);
            const applicableMasterId = (lvl > minBase) ? masterForLevel(lvl, rows, minBase) : '';
            const mod = (applicableMasterId && window.masters[applicableMasterId]) ? window.masters[applicableMasterId] : {};
            const modHP = Number(mod.HP || 0);
            const modAP = Number(mod.AP || 0);
            const modPWR = Number(mod.PWR || 0);
            const modDEF = Number(mod.DEF || 0);
            const modAGL = Number(mod.AGL || 0);
            const modINT = Number(mod.INT || 0);
            const addHP = Math.max(0, baseHP + (lvl > minBase ? modHP : 0));
            const addAP = Math.max(0, baseAP + (lvl > minBase ? modAP : 0));
            const addPWR = Math.max(0, basePWR + (lvl > minBase ? modPWR : 0));
            const addDEF = Math.max(0, baseDEF + (lvl > minBase ? modDEF : 0));
            const addAGL = Math.max(0, baseAGL + (lvl > minBase ? modAGL : 0));
            const addINT = Math.max(0, baseINT + (lvl > minBase ? modINT : 0));
            stats.HP += addHP;
            stats.AP += addAP;
            stats.PWR += addPWR;
            stats.DEF += addDEF;
            stats.AGL += addAGL;
            stats.INT += addINT;
        }
        document.getElementById('charName').textContent = window.characters[selectedChar].name;
        document.getElementById('charLevel').textContent = finalLevel;
        const imgEl = document.getElementById('charImg');
        if (imgEl) {
            imgEl.src = window.characters[selectedChar].img || '';
            imgEl.alt = window.characters[selectedChar].name || '';
        }
        document.getElementById('HP').textContent = stats.HP;
        document.getElementById('AP').textContent = stats.AP;
        document.getElementById('PWR').textContent = stats.PWR;
        document.getElementById('DEF').textContent = stats.DEF;
        document.getElementById('AGL').textContent = stats.AGL;
        document.getElementById('INT').textContent = stats.INT;
        document.getElementById('result').classList.remove('hidden');
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
};
window.addEventListener('DOMContentLoaded', async () => {
    if (window.mastersLoadedPromise) await window.mastersLoadedPromise;
    window.initSavedLevels && window.initSavedLevels();
    Object.keys(window.characters || {}).forEach(id => {
        if (!window.savedMasterRows[id]) window.savedMasterRows[id] = [];
    });
    const tabs = document.querySelectorAll('.char-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const charId = tab.dataset.char;
            renderMasterRowsForChar(charId);
            calculateStats();
        });
    });
    const activeChar = window.getSelectedChar();
    if (activeChar) renderMasterRowsForChar(activeChar);
    const addBtn = document.getElementById('addMasterBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const charId = window.getSelectedChar();
            if (!charId) return;
            if (!Array.isArray(window.savedMasterRows[charId])) window.savedMasterRows[charId] = [];
            const last = window.savedMasterRows[charId].slice(-1)[0];
            const minBase = (window.characters[charId] && Number.isInteger(window.characters[charId].minLevel)) ? window.characters[charId].minLevel : 1;
            const used = window.savedMasterRows[charId].reduce((s,r) => s + (Number(r.count||0)), 0);
            const min = 1;
            const remaining = Math.max(0, 99 - minBase - used);
            if (remaining <= 0) return;
            window.savedMasterRows[charId].push({ count: 1, master: '' });
            renderMasterRowsForChar(charId);
            calculateStats();
        });
    }
    window.calculateStats();
});