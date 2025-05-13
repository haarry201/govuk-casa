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

import aiFields from "./fields/ai.js"

import commuteFrequencyFields from "./fields/travel/commuting/commute-frequency.js"
import morningModeFields from "./fields/travel/commuting/morning-mode.js"
import btravelFrequencyFields from "./fields/travel/business-travel/btravel-frequency.js"
import commuteCarSizeFields from "./fields/travel/commuting/commute-car-size.js"
import sameReturnFields from "./fields/travel/commuting/same-return.js"
import commuteDistanceFields from "./fields/travel/commuting/commute-distance.js"
import commuteCarFuelFields from "./fields/travel/commuting/commute-car-fuel.js"
import eveningModeFields from "./fields/travel/commuting/evening-mode.js"
import btravelModeFields from "./fields/travel/business-travel/btravel-mode.js"
import btravelCarSizeFields from "./fields/travel/business-travel/btravel-car-size.js"
import btravelCarFuelFields from "./fields/travel/business-travel/btravel-car-fuel.js"
import btravelDistanceFields from "./fields/travel/business-travel/btravel-distance.js"




import { CalculateEmissionsMiddleware } from './middleware/calculateEmissionsMiddleware.js'

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
        waypoint: "ai",
        view: "pages/ai.njk",
        fields: aiFields()
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
        waypoint: "commute-car-size",
        view: "pages/travel/commuting/commute-car-size.njk",
        fields: commuteCarSizeFields()
    },
    {
        waypoint: "same-return",
        view: "pages/travel/commuting/same-return.njk",
        fields: sameReturnFields()
    },
    {
        waypoint: "commute-distance",
        view: "pages/travel/commuting/commute-distance.njk",
        fields: commuteDistanceFields()
    },
    {
        waypoint: "commute-car-fuel",
        view: "pages/travel/commuting/commute-car-fuel.njk",
        fields: commuteCarFuelFields()
    },
    {
        waypoint: "evening-mode",
        view: "pages/travel/commuting/evening-mode.njk",
        fields: eveningModeFields()
    },
    {
        waypoint: "btravel-mode",
        view: "pages/travel/business-travel/btravel-mode.njk",
        fields: btravelModeFields()
    },
    {
        waypoint: "btravel-car-size",
        view: "pages/travel/business-travel/btravel-car-size.njk",
        fields: btravelCarSizeFields()
    },
    {
        waypoint: "btravel-car-fuel",
        view: "pages/travel/business-travel/btravel-car-fuel.njk",
        fields: btravelCarFuelFields()
    },
    {
        waypoint: "btravel-distance",
        view: "pages/travel/business-travel/btravel-distance.njk",
        fields: btravelDistanceFields()
    },
    {
        waypoint: "summary",
        view: "pages/summary.njk",
        hooks: [
            {
                hook: "prerender",
                // middleware: (req, res, next) => {

                //     const exampleVariable = 'beepboop';
                //     //console.log('LOGGED')
                //     res.locals = {
                //         ...res.locals,
                //         casa: {
                //             ...res.locals.casa,
                //         },
                //         exampleVariable,
                //     }
                //     next();
                // },
                middleware: CalculateEmissionsMiddleware()
            }
        ]
    }
];
