window.gainsCache = {};
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