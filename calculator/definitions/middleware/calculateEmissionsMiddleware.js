
import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
var fs = require("fs"), json;


function readJsonFileSync(filepath, encoding){
    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    let file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getFactors(file){
    let filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}




const calculateEmissionsMiddleware = () => (req, res, next) => {


    const factors = getFactors('emissions.json');
    const allData = JSON.stringify(req.casa.journeyContext.getData(), null, 2);

    const laptopPageData = req.casa.journeyContext.getDataForPage('laptop');
    const desktopPageData = req.casa.journeyContext.getDataForPage('desktop');
    const monitorsPageData = req.casa.journeyContext.getDataForPage('monitors');
    const phonePageData = req.casa.journeyContext.getDataForPage('phone');

    const emailPageData = req.casa.journeyContext.getDataForPage('emails');
    const attachmentPageData = req.casa.journeyContext.getDataForPage('emails-attachments');
    const instantMessagesPageData = req.casa.journeyContext.getDataForPage('instant-messages');
    const callsPageData = req.casa.journeyContext.getDataForPage('calls');
    const cameraPageData = req.casa.journeyContext.getDataForPage('camera');

    const commuteFrequencyPageData = req.casa.journeyContext.getDataForPage('commute-frequency');
    const morningModePageData = req.casa.journeyContext.getDataForPage('morning-mode');
    const sameReturnPageData = req.casa.journeyContext.getDataForPage('same-return');
    const eveningModePageData = req.casa.journeyContext.getDataForPage('evening-mode');
    const commuteCarSizePageData = req.casa.journeyContext.getDataForPage('commute-car-size');
    const commuteCarFuelPageData = req.casa.journeyContext.getDataForPage('commute-car-fuel');
    const commuteDistancePageData = req.casa.journeyContext.getDataForPage('commute-distance');



    // DEVICES
    let laptopYearlyEmissions, desktopYearlyEmissions, monitorYearlyEmissions, phoneYearlyEmissions;
    // Laptop
    // Get laptop type from page data
    const laptopType = String(laptopPageData.laptop);
    if (laptopType == 'windows' || laptopType == 'macbook'){
        // Get laptop lifetime emissions from JSON file and convert to string
        let laptopTotalEmissions = JSON.stringify(factors.deviceFactors.laptop[laptopType])
        // Assumption that laptop is used for 5 years
        laptopYearlyEmissions = (+laptopTotalEmissions/5);
    } else {
        // If user selected that they don't have a work laptop, emissions will be 0
        laptopYearlyEmissions = 0;
    }

    // Desktop
    const hasDesktop = String(desktopPageData.desktop);
    // Only calculates desktop value if user answered 'Yes' on desktop page
    if (hasDesktop == 'yes'){
        // Desktop factors are split into embodied and usage (rather than just lifetime, like the other devices), so need to get desktop stats first.
        // Usage refers to the power draw of the device
        let desktopStats = factors.deviceFactors['desktop'];
        let desktopEmbodied = JSON.stringify(desktopStats['embodied']);
        let desktopUsage = JSON.stringify(desktopStats['usagePerYear']);
        // Yearly emissions are the embodied carbon (over assumed 5 year usage) + yearly usage
        desktopYearlyEmissions = (+desktopEmbodied/5) + +desktopUsage;
    } else {
        // If user answered 'No' on desktop page, emissions will be 0
        desktopYearlyEmissions = 0;
    }

    // Monitors
    // Yes/No if statement isn't required as user is asked how many monitors they have, rather than if they have one
    const monitorNum = String(monitorsPageData.monitors);
    let monitorTotalEmissions = JSON.stringify(factors.deviceFactors['monitor']);
    monitorYearlyEmissions = (+monitorTotalEmissions / 5) * +monitorNum;

    // Phone
    // For more detailed breakdown, see Laptop above
    const phoneType = String(phonePageData.phone);
    if (phoneType == 'iphone' || phoneType == 'android'){
        let phoneTotalEmissions = JSON.stringify(factors.deviceFactors.phone[phoneType]);
        phoneYearlyEmissions = +phoneTotalEmissions / 4;
    } else {
        phoneYearlyEmissions = 0;
    }

    // Total yearly device emissions
    let deviceYearlyEmissions = (+laptopYearlyEmissions + +desktopYearlyEmissions + +monitorYearlyEmissions + +phoneYearlyEmissions).toFixed(2);
    let deviceMonthlyEmissions = (+deviceYearlyEmissions/12).toFixed(2);



    // MESSAGING
    let callEmissionsHourly;
    // Emails
    const emailNum = String(emailPageData.emails);
    const attachmentNum = String(attachmentPageData.emailsAttachments);

    let emailEmission = JSON.stringify(factors.emailFactors['email']);
    let attachmentEmission = JSON.stringify(factors.emailFactors['emailAttachment']);
    // Calculate weekly emissions by multiplying email number and emission factor, then multiply by 52 to get yearly
    let emailYearlyEmissions = ((+emailNum * +emailEmission) + (+attachmentNum * +attachmentEmission)) * 52;

    // Teams
    const messageNum = String(instantMessagesPageData.instantMessages);
    const callsHours = String(callsPageData.calls);
    const cameraOn = String(cameraPageData.camera);

    const messageEmission = JSON.stringify(factors.messageFactors['messages']);

    // Check whether user has camera on/off and get appropriate emission factor
    if (cameraOn == 'yes'){
        callEmissionsHourly = JSON.stringify(factors.messageFactors['videoCalls']);
    }
    if (cameraOn == 'sometimes'){
        callEmissionsHourly = JSON.stringify(factors.messageFactors['sometimesVideoCalls']);
    }
    else {
        callEmissionsHourly = JSON.stringify(factors.messageFactors['audioCalls']);
    }
    let messageYearlyEmissions = ((+messageNum * +messageEmission) + (+callsHours * +callEmissionsHourly)) * 52;

    // Total messaging emissions
    let messagingYearlyEmissions = (+emailYearlyEmissions + +messageYearlyEmissions).toFixed(2);
    let messagingMonthlyEmissions = (+messagingYearlyEmissions/12).toFixed(2);



    // TRAVEL
    let morningCommuteTypeFactor, commutingYearlyEmissions, eveningCommuteTypeFactor, commuteCarSize, commuteCarFuel, eveningMode;
    // Commuting
    const commuteFrequency = String(commuteFrequencyPageData.commuteFrequency);
    const morningMode = String(morningModePageData.morningMode);
    const sameReturn = String(sameReturnPageData.sameReturn);
    const commuteDistance = String(commuteDistancePageData.commuteDistance);

    // Only calculate if user commutes 1 or more days a week
    if (commuteFrequency > 0){
        // If user uses a car, get car size and fuel type from relevant pages
        if (morningMode == 'car'){
            commuteCarSize = String(commuteCarSizePageData.commuteCarSize);
            commuteCarFuel = String(commuteCarFuelPageData.commuteCarFuel);
            // Assumes that if the user drives to work, they also drive back
            sameReturn = 'yes';
            // Get emissions factor based on size/fuel
            let carSizeFactor = factors.transportFactors.car[commuteCarSize];
            morningCommuteTypeFactor = JSON.stringify(carSizeFactor[commuteCarFuel]);
        } else if (morningMode == 'carshare'){
            // If they commute in a car share, do the same calculation but divide it by 2
            commuteCarSize = String(commuteCarSizePageData.commuteCarSize);
            commuteCarFuel = String(commuteCarFuelPageData.commuteCarFuel);
            let carSizeFactor = factors.transportFactors.car[commuteCarSize];
            morningCommuteTypeFactor = JSON.stringify(carSizeFactor[commuteCarFuel]);
            morningCommuteTypeFactor = +commuteTypeFactor / 2;
        } else {
            // If they don't use a car, get the emission factor normally
            morningCommuteTypeFactor = JSON.stringify(factors.transportFactors[morningMode])
        }
        let morningCommuteYearlyEmissions = (+morningCommuteTypeFactor * +commuteDistance * +commuteFrequency) * 52;

        if (sameReturn == 'yes'){
            // If user returns from work the same way, just double the morning commute
            commutingYearlyEmissions = +morningCommuteYearlyEmissions * 2;
        } else {
            // Same calculations as for the morning commute, except there is no option for just car
            // (assumption if user didn't drive to work, they won't be driving back unless in car share)
            eveningMode = String(eveningModePageData.eveningMode);
            if (eveningMode == 'carshare'){
                commuteCarSize = String(commuteCarSizePageData.commuteCarSize);
                commuteCarFuel = String(commuteCarFuelPageData.commuteCarFuel);
                let carSizeFactor = factors.transportFactors.car[commuteCarSize];
                eveningCommuteTypeFactor = JSON.stringify(carSizeFactor[commuteCarFuel]);
                eveningCommuteTypeFactor = +eveningCommuteTypeFactor / 2;
            } else {
                eveningCommuteTypeFactor = JSON.stringify(factors.transportFactors[eveningMode]);
            }
            let eveningCommuteYearlyEmissions = (+eveningCommuteTypeFactor * +commuteDistance * +commuteFrequency) * 52;
            commutingYearlyEmissions = +morningCommuteYearlyEmissions + +eveningCommuteYearlyEmissions;
        }
    } else {
        commutingYearlyEmissions = 0;
    }








    res.locals = {
        ...res.locals,
        casa: {
            ...res.locals.casa,
        },
        allData,
        deviceYearlyEmissions,
        deviceMonthlyEmissions,
        messagingYearlyEmissions,
        messagingMonthlyEmissions,
        commutingYearlyEmissions,
    }
    next();
}

const CalculateEmissionsMiddleware = () => calculateEmissionsMiddleware();
export {CalculateEmissionsMiddleware};
