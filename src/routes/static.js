import ExpressJS from "express";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { resolve } from "node:path";
import { createRequire } from "node:module";

import dirname from "./dirname.cjs";
import MutableRouter from "../lib/MutableRouter.js";
import { validateUrlPath } from "../lib/utils.js";

const { static: ExpressStatic } = ExpressJS; // CommonJS

/**
 * @typedef {object} StaticOptions Options to configure static router
 * @property {number} [maxAge=3600000] Cache TTL for all assets. Default is
 *   `3600000`
 * @property {string} [cacheControl=private] Cache control headers. Default is
 *   `private`
 */

/**
 * Create a router for serving CASA's static assets.
 *
 * @param {StaticOptions} options Options
 * @returns {MutableRouter} ExpressJS Router instance
 * @access private
 */
export default function staticRouter({
  maxAge = 3600000,
  cacheControl = "private",
} = {}) {
  const router = new MutableRouter();

  const notFoundHandler = (req, res, next) => {
    // Fall through to a general purpose error handler
    next(new Error("404"));
  };

  const setHeaders = (req, res, next) => {
    res.set("cache-control", cacheControl);
    res.set("expires", new Date(Date.now() + maxAge).toUTCString());
    const { pathname } = new URL(
      req?.originalUrl ?? "",
      "https://placeholder.test/",
    );
    if (pathname.substr(-4) === ".css") {
      // Just needed for our in-memory CSS assets
      res.set("content-type", "text/css");
    }
    next();
  };

  const staticConfig = {
    etag: true,
    lastModified: false,
    maxAge,
    setHeaders: (res) => {
      setHeaders(null, res, () => {});
    },
  };

  // The CASA CSS source contains the placeholder `~~~CASA_MOUNT_URL~~~` which
  // must be replaced with the dynamic `mountUrl` to ensure govuk-frontend
  // assets are served from the correct location.
  /* eslint-disable security/detect-non-literal-fs-filename */
  const casaCss = readFileSync(
    resolve(dirname, "../../dist/assets/css/casa.css"),
    { encoding: "utf8" },
  );
  /* eslint-enable security/detect-non-literal-fs-filename */

  // The static middleware will only server GET/HEAD requests, so we can mount
  // the middleware using `use()` rather than resorting to `get()`
  const govukFrontendDirectory = resolve(
    createRequire(dirname).resolve("govuk-frontend"),
    "../../",
  );

  router.use(
    "/govuk/govuk-frontend.min.js",
    ExpressStatic(
      `${govukFrontendDirectory}/govuk/govuk-frontend.min.js`,
      staticConfig,
    ),
  );
  router.use(
    "/govuk/govuk-frontend.min.js.map",
    ExpressStatic(
      `${govukFrontendDirectory}/govuk/govuk-frontend.min.js.map`,
      staticConfig,
    ),
  );
  router.use(
    "/govuk/assets",
    ExpressStatic(`${govukFrontendDirectory}/govuk/assets`, staticConfig),
  );
  router.use("/govuk/assets", notFoundHandler);

  router.get("/casa/assets/css/casa.css", setHeaders, (req, res) =>
    res.send(
      casaCss.replace(
        /~~~CASA_MOUNT_URL~~~/g,
        validateUrlPath(`${req.baseUrl}/`),
      ),
    ),
  );
  router.use(
    "/casa/assets/css/casa.css.map",
    ExpressStatic(resolve(dirname, "../../dist/assets/css/casa.css.map")),
  );
  router.use("/casa/assets", notFoundHandler);

  return router;
}
