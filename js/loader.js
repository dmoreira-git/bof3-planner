window.gainsCache = {};
window.masters = {};
window.mastersLoadedPromise = (async function() {
    try {
        const res = await fetch('masters.json');
        if (!res.ok) return;
        const json = await res.json();
        if (!json || !Array.isArray(json.masters)) return;
        json.masters.forEach(m => {
            const id = m.id || m.name;
            window.masters[id] = {
                name: m.name || id,
                HP: Number(m.HP || 0),
                AP: Number(m.AP || 0),
                PWR: Number(m.PWR || 0),
                DEF: Number(m.DEF || 0),
                AGL: Number(m.AGL || 0),
                INT: Number(m.INT || 0)
            };
        });
    } catch (e) {}
})();
window.loadGains = async function(charId) {
    if (window.gainsCache[charId]) return window.gainsCache[charId];
    const charData = window.characters[charId];
    if (!charData) throw new Error(`Unknown character id "${charId}".`);
    const resp = await fetch(charData.csv);
    if (!resp.ok) throw new Error(`Failed to load ${charData.csv}`);
    const text = await resp.text();
    const lines = text.trim().split('\n');
    const gains = lines.map(line => {
        const values = line.split(',').map(v => parseFloat(v.trim()));
        if (values.length !== 6 || values.some(isNaN)) throw new Error(`Invalid data in ${charData.csv}`);
        return values;
    });
    if (gains.length !== 99) throw new Error(`${charData.csv} does not have exactly 99 lines`);
    window.gainsCache[charId] = gains;
    return gains;
};