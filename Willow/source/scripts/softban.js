let softbanned = {};

function getSoftbanned(id) {
    return softbanned[id] || null;
}

function validateSoftban(id) {
    const isBanned = !!softbanned[id];
    return isBanned
}

function addSoftban(id, list) {
    softbanned[id] = list;
}

function removeSoftban(id) {
    delete softbanned[id];
}

function getAllSoftbanned() {
    return Object.keys(softbanned);
}

module.exports = { getSoftbanned, validateSoftban, addSoftban, removeSoftban, getAllSoftbanned };
