import { field, validators as r, ValidationError} from "@dwp/govuk-casa";

export default () => [
    field("bTravelCarSize").validators([
        r.required.make({
        errorMsg: "You need to choose an answer"
        })
    ])
];
