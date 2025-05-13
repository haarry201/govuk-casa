import ExpressJS from "express";

import { dirname, resolve } from "path";

import pages from "./definitions/pages.js"
import planFactory from "./definitions/plan.js"

import { configure } from '@dwp/govuk-casa';
import { fileURLToPath } from "url";

import checkYourAnswersPlugin from "./plugins/check-your-answers/plugin.js";

const { static: expressStatic } = ExpressJS;

const __dirname = dirname(fileURLToPath(import.meta.url));

const application = ({ MOUNT_URL = "/" }) => {
    const plan = planFactory();
    const { mount } = configure({
        views: [resolve(__dirname, "views")],
        session: {
            name: "myappsessionid",
            secret: "secret",
            ttl: 3600,
            secure: false,
        },
        plugins: [
            checkYourAnswersPlugin({
              waypoints: ["review"],
            }),
          ],
        i18n: {
          dirs: [resolve(__dirname, "locales")],
          locales: ["en"],
        },
        pages: pages(),
        plan
    });



    const casaApp = ExpressJS();
    mount(casaApp);

    const app = ExpressJS();
    app.use(MOUNT_URL, casaApp);

    app.use(ExpressJS.static('assets'));

    return app;
}

export default application;
