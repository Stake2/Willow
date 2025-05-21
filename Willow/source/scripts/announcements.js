const announcements = require('../jsons/announcements.json');
const { addServersMessage, addServerMessage } = require('./serverlist');

let announcementIndex = 0;
let useRandomNext = false;

function getAnnouncement() {
    const announcement = announcements[announcementIndex];
    announcementIndex = (announcementIndex + 1) % announcements.length;
    return announcement;
}

function getRandomAnnouncement() {
    const index = Math.floor(Math.random() * announcements.length);
    return announcements[index];
}

function getSemiRandomAnnouncement() {
    const result = useRandomNext ? getRandomAnnouncement() : getAnnouncement();
    useRandomNext = !useRandomNext;
    return result;
}

function addServerAnnouncement() {
    const announcement = getAnnouncement();
    addServersMessage({ key: "message", value: { message: `${announcement}`, name: `Aviso`, type: "private" } });
}

function addServerAnnouncementRandom() {
    const announcement = getRandomAnnouncement();
    addServersMessage({ key: "message", value: { message: `${announcement}`, name: `Aviso`, type: "private" } });
}

function addServerAnnouncementSemiRandom() {
    const announcement = getSemiRandomAnnouncement();
    addServersMessage({ key: "message", value: { message: `${announcement}`, name: `Aviso`, type: "private" } });
}

module.exports = { getAnnouncement, getRandomAnnouncement, getSemiRandomAnnouncement, addServerAnnouncement, addServerAnnouncementRandom, addServerAnnouncementSemiRandom };
