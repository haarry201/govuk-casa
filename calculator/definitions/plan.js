import { Plan } from "@dwp/govuk-casa";

export default () => {
    const plan = new Plan({})
    plan.addSequence("laptop", "desktop", "monitors", "phone", "emails", "emails-attachments", "instant-messages", "calls", "camera", "email-storage", "onedrive-storage", "printing", "commute-frequency");

    plan.setRoute(
        "commute-frequency",
        "btravel-frequency",
        (r,c) => c.data["commute-frequency"].commuteFrequency == 0,
    );
    plan.setRoute(
        "commute-frequency",
        "morning-mode",
        (r,c) => c.data["commute-frequency"].commuteFrequency > 0,
    );

    plan.setRoute(
        "morning-mode",
        "commute-car-size",
        (r,c) => c.data["morning-mode"].morningMode == 'car',
    );
    plan.setRoute(
        "morning-mode",
        "same-return",
        (r,c) => c.data["morning-mode"].morningMode != 'car',
    );

    plan.setRoute(
        "same-return",
        "commute-distance",
        (r,c) => c.data["same-return"].sameReturn == 'yes',
    );
    plan.setRoute(
        "same-return",
        "evening-mode",
        (r,c) => c.data["same-return"].sameReturn == 'no',
    );

    plan.setRoute("evening-mode", "commute-distance");

    plan.setRoute("commute-car-size", "commute-car-fuel");
    plan.setRoute("commute-car-fuel", "commute-distance");

    plan.setRoute("commute-distance", "btravel-frequency");

    plan.setRoute(
        "btravel-frequency",
        "btravel-mode",
        (r,c) => c.data["btravel-frequency"].btravelFrequency > 0,
    );
    plan.setRoute(
        "btravel-frequency",
        "check-answers",
        (r,c) => c.data["btravel-frequency"].btravelFrequency == 0,
    );

    plan.setRoute(
        "btravel-mode",
        "btravel-car-size",
        (r,c) => c.data["btravel-mode"].btravelMode == 'car',
    );
    plan.addSequence("btravel-car-size", "btravel-car-fuel", "btravel-distance");

    plan.setRoute(
        "btravel-mode",
        "btravel-distance",
        (r,c) => c.data["btravel-mode"].btravelMode != 'car',
    );

    plan.addSequence("btravel-distance", "check-answers", "results");



    return plan;
};
