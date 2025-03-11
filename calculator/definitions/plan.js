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
        "car-size",
        (r,c) => c.data["morning-mode"].morningMode == 'car',
    );
    plan.setRoute(
        "morning-mode",
        "return",
        (r,c) => c.data["morning-mode"].morningMode != 'car',
    );


    return plan;
};
