window.characters = {
    Ryu:  { name: 'Ryu',  csv: 'ryu.csv',  minLevel: 1 },
    Nina: { name: 'Nina', csv: 'nina.csv', minLevel: 5 },
    Momo: { name: 'Momo', csv: 'momo.csv', minLevel: 10 },
    Rei:  { name: 'Rei',  csv: 'rei.csv',  minLevel: 5 },
    Peco: { name: 'Peco', csv: 'peco.csv', minLevel: 1 },
    Garr: { name: 'Garr', csv: 'garr.csv', minLevel: 13 }
};
window.savedLevels = {};
window.initSavedLevels = function() {
    Object.keys(window.characters).forEach(id => {
        const m = window.characters[id] && Number.isInteger(window.characters[id].minLevel) ? window.characters[id].minLevel : 1;
        window.savedLevels[id] = m;
    });
};