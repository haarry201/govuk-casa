
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
    console.log(filepath);
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

    const printingPageData = req.casa.journeyContext.getDataForPage('printing');
    const emailStoragePageData = req.casa.journeyContext.getDataForPage('email-storage');
    const onedriveStoragePageData = req.casa.journeyContext.getDataForPage('onedrive-storage');

    const commuteFrequencyPageData = req.casa.journeyContext.getDataForPage('commute-frequency');
    const morningModePageData = req.casa.journeyContext.getDataForPage('morning-mode');
    const sameReturnPageData = req.casa.journeyContext.getDataForPage('same-return');
    const eveningModePageData = req.casa.journeyContext.getDataForPage('evening-mode');
    const commuteCarSizePageData = req.casa.journeyContext.getDataForPage('commute-car-size');
    const commuteCarFuelPageData = req.casa.journeyContext.getDataForPage('commute-car-fuel');
    const commuteDistancePageData = req.casa.journeyContext.getDataForPage('commute-distance');

    const bTravelFrequencyPageData = req.casa.journeyContext.getDataForPage('btravel-frequency');
    const bTravelModePageData = req.casa.journeyContext.getDataForPage('btravel-mode');
    const bTravelCarSizePageData = req.casa.journeyContext.getDataForPage('btravel-car-size');
    const bTravelCarFuelPageData = req.casa.journeyContext.getDataForPage('btravel-car-fuel');
    const bTravelDistancePageData = req.casa.journeyContext.getDataForPage('btravel-distance');


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


    // DATA STORAGE
    // Printing
    const printingFrequency = String(printingPageData.printing);
    const printingEmissions = JSON.stringify(factors.printingFactors['perPage']);
    let totalPrintingEmissionsYearly = (+printingFrequency * +printingEmissions) * 52;

    // Email storage
    const clearEmailFrequency = String(emailStoragePageData.emailStorage);
    const gbGramsPerHour = JSON.stringify(factors.cloudStorageFactors['gbGramsPerHour']);

    let inboxNum = +emailNum * 2;
    var monthlyEmails = +inboxNum * 5 * 4;
    // Inbox size in KB (assuming average email is 100KB)
    let monthlyInboxSize = +monthlyEmails * 100;
    // Inbox size in GB
    let monthlyInboxSizeGB = +monthlyInboxSize / 1000000;
    let averageInboxSize = +monthlyInboxSizeGB * +clearEmailFrequency;
    let emailStorageEmissions = ((+averageInboxSize * +gbGramsPerHour * 24 * 365.25) / 1000) / 2;

    // OneDrive storage
    const clearOneDriveFrequency = String(onedriveStoragePageData.onedriveStorage);
    // Assumed OneDrive size - 1GB
    let averageOneDriveSize = 1 * clearOneDriveFrequency;
    let oneDriveStorageEmissions = ((+averageOneDriveSize * gbGramsPerHour * 24 * 365) / 1000) / 2;

    // Total data storage
    const dataStorageYearlyEmissions = (+totalPrintingEmissionsYearly + +emailStorageEmissions + +oneDriveStorageEmissions).toFixed(2);
    const dataStorageMonthlyEmissions = (+dataStorageYearlyEmissions / 12).toFixed(2);



    // TRAVEL
    let morningCommuteTypeFactor, commutingYearlyEmissions, eveningCommuteTypeFactor, commuteCarSize, commuteCarFuel, eveningMode, sameReturn;
    // Commuting
    const commuteFrequency = String(commuteFrequencyPageData.commuteFrequency);

    // Only calculate if user commutes 1 or more days a week
    if (commuteFrequency > 0){
        const morningMode = String(morningModePageData.morningMode);
        // Get commute distance and convert from miles to KM
        const commuteDistance = +(String(commuteDistancePageData.commuteDistance)) * 1.609344;
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
            sameReturn = String(sameReturnPageData.sameReturn);
            commuteCarSize = String(commuteCarSizePageData.commuteCarSize);
            commuteCarFuel = String(commuteCarFuelPageData.commuteCarFuel);
            let carSizeFactor = factors.transportFactors.car[commuteCarSize];
            morningCommuteTypeFactor = JSON.stringify(carSizeFactor[commuteCarFuel]);
            morningCommuteTypeFactor = +commuteTypeFactor / 2;
        } else {
            sameReturn = String(sameReturnPageData.sameReturn);
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


    // Business travel
    let transportFactor, bTravelYearlyEmissions;
    const bTravelFrequency = String(bTravelFrequencyPageData.bTravelFrequency);

    if (bTravelFrequency > 0){
        const bTravelMode = String(bTravelModePageData.bTravelMode);
        // Get business travel distance and convert from miles to KM
        const bTravelDistance = +(String(bTravelDistancePageData.bTravelDistance)) * 1.609344;
        if (bTravelMode == 'car'){
            const carSize = String(bTravelCarSizePageData.bTravelCarSize);
            const carFuel = String(bTravelCarFuelPageData.bTravelCarFuel);
            let carSizeFactor = factors.transportFactors.car[carSize];
            transportFactor = JSON.stringify(carSizeFactor[carFuel]);
        } else {
            transportFactor = JSON.stringify(factors.transportFactors[bTravelMode]);
        }
        let bTravelMonthlyEmissions = +bTravelFrequency * +bTravelDistance * +transportFactor;
        bTravelYearlyEmissions = +bTravelMonthlyEmissions * 12;
    } else {
        bTravelYearlyEmissions = 0;
    }

    // Total travel emissions
    let travelYearlyEmissions = (+bTravelYearlyEmissions + +commutingYearlyEmissions).toFixed(2);
    let travelMonthlyEmissions = (+travelYearlyEmissions / 12).toFixed(2);


    // RESULTS
    // Total emissions
    const totalEmissions = (+deviceYearlyEmissions + +messagingYearlyEmissions + +dataStorageYearlyEmissions + +travelYearlyEmissions).toFixed(2);
    // Percentages
    const devicePercentage = ((+deviceYearlyEmissions/+totalEmissions)*100).toFixed(2);
    const messagingPercentage = ((+messagingYearlyEmissions/+totalEmissions)*100).toFixed(2);
    const dataStoragePercentage = ((+dataStorageYearlyEmissions/+totalEmissions)*100).toFixed(2);
    const travelPercentage = ((+travelYearlyEmissions/+totalEmissions)*100).toFixed(2);

    // Tea calculation
    let teaCarbon = 0.021;
    let teaTotal = (+totalEmissions/+teaCarbon).toFixed(0);


    // RATING SYSTEM
    let deviceRating, messagingRating, storageRating, travelRating;
    // Devices rating
    if (deviceYearlyEmissions <= 150){
        deviceRating = 1;
    }
    if (deviceYearlyEmissions > 150 && deviceYearlyEmissions <= 250){
        deviceRating = 2;
    }
    if (deviceYearlyEmissions > 250 && deviceYearlyEmissions <= 350){
        deviceRating = 3;
    }
    if (deviceYearlyEmissions > 350){
        deviceRating = 4;
    }

    // Messaging rating
    if (messagingYearlyEmissions <= 70){
        messagingRating = 1;
    }
    if (messagingYearlyEmissions > 70 && messagingYearlyEmissions <= 100){
        messagingRating = 2;
    }
    if (messagingYearlyEmissions > 100 && messagingYearlyEmissions <= 140){
        messagingRating = 3;
    }
    if (messagingYearlyEmissions > 140){
        messagingRating = 4;
    }

    // Data storage rating
    if (dataStorageYearlyEmissions <= 8){
        storageRating = 1;
    }
    if (dataStorageYearlyEmissions > 8 && dataStorageYearlyEmissions <= 20){
        storageRating = 2;
    }
    if (dataStorageYearlyEmissions > 20 && dataStorageYearlyEmissions <= 60){
        storageRating = 3;
    }
    if (dataStorageYearlyEmissions > 60){
        storageRating = 4;
    }

    // Travel rating
    if (travelYearlyEmissions <= 50){
        travelRating = 1;
    }
    if (travelYearlyEmissions > 50 && travelYearlyEmissions <= 100){
        travelRating = 2;
    }
    if (travelYearlyEmissions > 100 && travelYearlyEmissions <= 200){
        travelRating = 3;
    }
    if (travelYearlyEmissions > 200){
        travelRating = 4;
    }

    // Overall rating
    let overallRating = (+deviceRating + +messagingRating + +storageRating + +travelRating)/4;


    // PERSONAS
    let persona, personaTitle, personaDescription, personaImprovements, src;

    if (overallRating <= 1.75){
        persona = "eco-champion-img";
        src = "/images/ecochampion.png";
        personaTitle = "Eco Champion";
        personaDescription = "You’re the best of the best! The crème de la crème! The eco champion! You do so much for the earth, you’re deeply committed to the environment and the preservation of our planet. You make conscious decisions at every turn to reduce your carbon footprint, and we can’t thank you enough for that!";
        personaImprovements = "Spread your positive habits by taking part in workplace sustainability initiatives. Encourage teammates and colleagues to reduce their carbon footprint by taking public transport to work or switching off any unneeded equipment such as extra monitors.";
    }
    if (overallRating > 1.75 && overallRating <= 2.5){
        persona = "green-advocate-img";
        src = "/images/green-advocate.png";
        personaTitle = "Green Advocate";
        personaDescription = "Good job! You’ve made some great strides towards reducing your carbon footprint. If everyone could be more like you, then we’d be well on our way to resolving this climate emergency!";
        personaImprovements = "Try challenging yourself to attempting 1 new sustainable habit every month, such as cycling to work instead of getting the bus for a week, or bringing your own lunch to work instead of buying it from the canteen.";
    }
    if (overallRating > 2.5 && overallRating <= 3.25){
        persona = "environmentally-curious-img";
        src = "/images/environmentally-curious.png";
        personaTitle = "Environmentally curious";
        personaDescription = "We’re glad you’re interested! Making sustainable changes to your lifestyle can seem overwhelming, but it’s much easier than it seems! All you have to do to start is make 1 small change, and then when you’re comfortable with that make another small change, and so on and so on.";
        personaImprovements = "Try taking public transport to work instead of driving. Try turning off devices such as monitors when you’re not using them. Try saving documents digitally instead of printing off.";
    }
    if (overallRating > 3.25){
        persona = "carbon-heavyweight-img";
        src = "/images/carbon-heavyweight.png";
        personaTitle = "Carbon Heavyweight";
        personaDescription = "Wow! Your carbon footprint is hefty! While we understand that not everyone can control all aspects of their carbon footprint, it would be great if you could try to make some small changes for the planet.";
        personaImprovements = "Turn off devices such as laptop and monitors at the end of the work day. Take public transport to work instead of driving. Next time you’re buying a new car, consider going for an electric vehicle. Use a reuseable water bottle instead of buying disposable.";
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
        dataStorageYearlyEmissions,
        travelYearlyEmissions,
        totalEmissions,
        devicePercentage,
        messagingPercentage,
        dataStoragePercentage,
        travelPercentage,
        teaTotal,
        overallRating,
        persona,
        personaTitle,
        personaDescription,
        personaImprovements,
        deviceRating,
        messagingRating,
        storageRating,
        travelRating,
        src,
    }
    next();
}

const CalculateEmissionsMiddleware = () => calculateEmissionsMiddleware();
export {CalculateEmissionsMiddleware};
