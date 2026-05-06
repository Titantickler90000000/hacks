javascript:
// ==UserScript==
// @name         Nitro Type - Admin Panel
// @version      0.1.0
// @description  Always displays the selected car, hue and trail on the race track.
// @author       sunnyjackal365
// @match        *://*.nitrotype.com/race
// @match        *://*.nitrotype.com/race/*
// @match        *://*.nitrotype.com/garage/customizer
// @match        *://*.nitrotype.com/garage/customizer/*
// @grant        GM_getResourceURL
// @resource     icon_tab https://i.ibb.co/28Ts3Xd/key-icon.png#sha512=3b8723fb0a6f220c9fa03ea38d9a600df2efe9dc38217b0be4a71132d12457edd6344c7c12370e5a451ea6199fb39a06dabc94c7c8c9782c1c4584b6e5d04a53
// @require      https://greasyfork.org/scripts/443718-nitro-type-userscript-utils/code/Nitro%20Type%20Userscript%20Utils.js?version=1042360
// @require      https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.2/dexie.min.js#sha512-/Aa8vGWIh0EnOTIVN/ZWTS3UqyJJDhWYtIPS/IqtaaSG0VA6hC6CSvtWdh2+T72q74+2l1RFgu+ig91LGLX57A==
// @license      MIT
// @namespace    https://greasyfork.org/users/858426
// ==/UserScript==

/* global NTGLOBALS findReact createLogger Dexie */

const logging = createLogger("Nitro Type Admin Panel");

const db = new Dexie("NTAdminPanel");
db.version(1).stores({
    savedCar: "userID",
});
db.open().catch(function (e) {
    logging.error("Init")("Failed to open up the config database", e);
});

let currentUser = null;
try {
    currentUser = JSON.parse(JSON.parse(localStorage.getItem("persist:nt")).user);
    if (!currentUser.loggedIn) {
        logging.error("Init")("Custom Car is only available for logged in users.");
    }
} catch (err) {
    logging.error("Init")("Failed to identify current logged in user");
    return;
}

db.savedCar.get(currentUser.userID).then(main);

function main(config) {
    if (
        window.location.pathname === "/garage/customizer" ||
        window.location.pathname.startsWith("/garage/customizer/")
    ) {
        const container = document.querySelector("#root main.structure-content div.customizer");
        const reactObj = container ? findReact(container) : null;
        if (!container || !reactObj) {
            logging.error("Init")("Unable to find customizer container");
            return;
        }

        const RARITY_VALUES = {
            common: 1,
            uncommon: 2,
            rare: 3,
            epic: 4,
            legendary: 5,
        };

        const tabContainer = container.querySelector(".customizer--tabs.nav-list");
        const titleHeading = container.querySelector(".customizer--about--title");
        const previewer = container.querySelector(".customizer--previewer");
        const previewerCanvas = previewer ? previewer.querySelector("canvas") : null;
        if (!tabContainer || !titleHeading || !previewerCanvas) {
            logging.error("Init")("Unable to modify tab navigation");
            return;
        }

        const style = document.createElement("style");
        style.appendChild(
            document.createTextNode(`
.section-nt-admin-panel .customizer--previewer {
    right: 714px;
    bottom: 230px;
}
.section-nt-admin-panel.nt-admin-panel-unset .customizer--previewer {
    right: 580px;
    bottom: 230px;
}
.nt-admin-panel-label.customizer--preview {
    left: 10px;
    right: 715px;
    top: 285px;
    bottom: 230px;
}
.nt-admin-panel-label.customizer--preview .customizer--vehicle-selection--name {
    font-size: 16px;
}
.nt-admin-panel-label.customizer--preview .customizer--vehicle-selection--rarity {
    padding-bottom: 0;
}
.nt-admin-panel-no-cars {
    position: absolute;
    top: 90px;
    left: 10px;
    right: 580px;
    bottom: 230px;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background-color: #202020;
    font-size: 18px;
    font-weight: 600;
    text-shadow: 0 2px 3px rgb(0 0 0 / 50%);
    color: #fff;
    z-index: 2;
}
.nt-admin-panel-unset .nt-admin-panel-no-cars {
    display: flex;
}
.nt-admin-panel-scrollable {
    overflow-y: scroll;
    scrollbar-face-color: #1C99F4;
    scrollbar-track-color: #232633;
}
.nt-admin-panel-scrollable::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
.nt-admin-panel-scrollable::-webkit-scrollbar-thumb {
    background-color: #1C99F4;
}
.nt-admin-panel-scrollable::-webkit-scrollbar-track {
    background-color: #232633;
}
.section-nt-admin-panel .customizer--item-selector-controls {
    grid-template-columns: 1fr 210px;
}
.customizer--item-selector.nt-admin-panel-car-selector {
    width: 560px;
}
.customizer--item-selector.nt-admin-panel-car-selector .customizer--item-selector-items {
    grid-template-columns: repeat(4, 1fr);
}
.customizer--item-selector.nt-admin-panel-trail-selector {
    top: 380px;
    left: 10px;
}
.customizer--item-selector.nt-admin-panel-paint-selector {
    top: 90px;
    bottom: 230px;
    left: 320px;
    width: 125px;
}
.customizer--item-selector.nt-admin-panel-paint-selector .nt-admin-panel-paint-selector-heading {
    display: flex;
    align-items: center;
    column-gap: 10px;
    height: 35px;
    padding: 0 10px;
    margin-bottom: 5px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: #282b3a;
    color: #eee;
    font-weight: bold;
    font-size: 13px;
}
.customizer--item-selector.nt-admin-panel-paint-selector .nt-admin-panel-paint-selector-heading .nt-admin-panel-paint-selector-heading-icon,
.customizer--item-selector.nt-admin-panel-paint-selector .nt-admin-panel-paint-selector-heading .nt-admin-panel-paint-selector-heading-icon svg {
    width: 
