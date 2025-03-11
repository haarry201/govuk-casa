import laptopFields from "./fields/devices/laptop.js";
import desktopFields from "./fields/devices/desktop.js";
import monitorsFields from "./fields/devices/monitors.js";
import phoneFields from "./fields/devices/phone.js"

import emailsFields from "./fields/messaging/emails.js"
import emailsAttachmentsFields from "./fields/messaging/emails-attachments.js"
import instantMessagesFields from "./fields/messaging/instant-messages.js"
import callsFields from "./fields/messaging/calls.js"
import cameraFields from "./fields/messaging/camera.js"

import emailStorageFields from "./fields/data-storage/email-storage.js"
import onedriveStorageFields from "./fields/data-storage/onedrive-storage.js"
import printingFields from "./fields/data-storage/printing.js"

import commuteFrequencyFields from "./fields/travel/commuting/commute-frequency.js"
import morningModeFields from "./fields/travel/commuting/morning-mode.js"
import btravelFrequencyFields from "./fields/travel/business-travel/btravel-frequency.js"
import carSizeFields from "./fields/travel/commuting/car-size.js"


export default () => [
    {
        waypoint: "laptop",
        view: "pages/devices/laptop.njk",
        fields: laptopFields()
    },
    {
        waypoint: "desktop",
        view: "pages/devices/desktop.njk",
        fields: desktopFields()
    },
    {
        waypoint: "monitors",
        view: "pages/devices/monitors.njk",
        fields: monitorsFields()
    },
    {
        waypoint: "phone",
        view: "pages/devices/phone.njk",
        fields: phoneFields()
    },
    {
        waypoint: "emails",
        view: "pages/messaging/emails.njk",
        fields: emailsFields()
    },
    {
        waypoint: "emails-attachments",
        view: "pages/messaging/emails-attachments.njk",
        fields: emailsAttachmentsFields()
    },
    {
        waypoint: "instant-messages",
        view: "pages/messaging/instant-messages.njk",
        fields: instantMessagesFields()
    },
    {
        waypoint: "calls",
        view: "pages/messaging/calls.njk",
        fields: callsFields()
    },
    {
        waypoint: "camera",
        view: "pages/messaging/camera.njk",
        fields: cameraFields()
    },
    {
        waypoint: "email-storage",
        view: "pages/data-storage/email-storage.njk",
        fields: emailStorageFields()
    },
    {
        waypoint: "onedrive-storage",
        view: "pages/data-storage/onedrive-storage.njk",
        fields: onedriveStorageFields()
    },
    {
        waypoint: "printing",
        view: "pages/data-storage/printing.njk",
        fields: printingFields()
    },
    {
        waypoint: "commute-frequency",
        view: "pages/travel/commuting/commute-frequency.njk",
        fields: commuteFrequencyFields()
    },
    {
        waypoint: "morning-mode",
        view: "pages/travel/commuting/morning-mode.njk",
        fields: morningModeFields()
    },
    {
        waypoint: "btravel-frequency",
        view: "pages/travel/business-travel/btravel-frequency.njk",
        fields: btravelFrequencyFields()
    },
    {
        waypoint: "car-size",
        view: "pages/travel/commuting/car-size.njk",
        fields: carSizeFields()
    }
];
