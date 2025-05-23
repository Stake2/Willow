const { fetchAllMembers } = require('../discord');
const { print } = require('../utils/output');
const { addServerAnnouncementRandom } = require('./announcements');
const { setupMods } = require('./modlist');
const { clearCheaters } = require('./monitor');
const { callMonitor } = require('./serverlist');

function routineHourly() {
  fetchAllMembers();
  setInterval(() => {
    clearCheaters();
    fetchAllMembers();
  }, 1000 * 60 * 60);
}

function routineHalfHourly() {
  setInterval(() => {}, 1000 * 60 * 30);
}

function routineTwentyMinutes() {
  addServerAnnouncementRandom();
  setInterval(() => {
    addServerAnnouncementRandom();
  }, 1000 * 60 * 20);
}

function routineTenMinutes() {
  callMonitor();
  setInterval(() => {
    callMonitor();
    setupMods();
  }, 1000 * 60 * 10);
}

function startRoutines() {
  print(`[Setup] Starting: Main routines`);
  routineHourly();
  routineHalfHourly();
  routineTwentyMinutes();
  routineTenMinutes();
}

module.exports = { startRoutines };
