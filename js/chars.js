window.characters = {
    Ryu:  { name: 'Ryu',  csv: 'ryu.csv',  minLevel: 1, img: 'imgs/ryu.png' },
    Nina: { name: 'Nina', csv: 'nina.csv', minLevel: 5, img: 'imgs/nina.png' },
    Momo: { name: 'Momo', csv: 'momo.csv', minLevel: 10, img: 'imgs/momo.png' },
    Rei:  { name: 'Rei',  csv: 'rei.csv',  minLevel: 5, img: 'imgs/rei.png' },
    Garr: { name: 'Garr', csv: 'garr.csv', minLevel: 13, img: 'imgs/garr.png' },
    Peco: { name: 'Peco', csv: 'peco.csv', minLevel: 1, img: 'imgs/peco.png' }
};
window.savedLevels = {};
window.initSavedLevels = function() {
    Object.keys(window.characters).forEach(id => {
        const m = window.characters[id] && Number.isInteger(window.characters[id].minLevel) ? window.characters[id].minLevel : 1;
        window.savedLevels[id] = m;
    });
};