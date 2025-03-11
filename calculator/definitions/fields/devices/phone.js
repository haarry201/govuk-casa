import { field, validators as r, ValidationError} from "@dwp/govuk-casa";

export default () => [
    field("phone").validators([
        r.required.make({
        errorMsg: "You need to choose an answer"
        })
    ])
];
