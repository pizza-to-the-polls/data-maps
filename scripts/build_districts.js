#!/usr/bin/env node
const fs = require("fs");
const topojson = require("topojson-server");

const debug = true;
const districts_file = "./scripts/districts.json";

const connector = require(debug ? "http" : "https");

const getRaw = async url => {
  let data;
  const headers = {
    "User-Agent": "github.com/noahmanger/data-for-progress-maps"
  }
  const options = debug
    ? {
        port: 8000,
        hostname: "localhost",
        path: url,
        headers: headers
      }
    : {
        port: 443,
        hostname: "raw.githubusercontent.com",
        path: `/unitedstates/districts/gh-pages${url}`,
        headers: headers
      };

  return new Promise((resolve, reject) => {
    const req = connector.get(options, resp => {
      let raw = "";

      resp.on("data", chunk => (raw += chunk));

      resp.on("end", (...args) => {
        if (resp.statusCode > 299) {
          resolve(null);
        }
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on("error", err => console.error(err));
  });
};

const getShapeFiles = async (year, district) => {
  return await getRaw(`/cds/${year}/${district}/shape.geojson`);
};

getDistricts = async (raw, combined) => {
  combined = combined || {};
  const current = raw.pop();

  if (current) {
      try {
        combined[current.id] = await getShapeFiles(2018, current.district);

        if( !combined[current.id] ) {
          combined[current.id] = await getShapeFiles(2016, current.district);
        }

        // Lone congressional districts are sometimes labeled as District 1
        // and sometimes as District 0, if not found should try again with 0
        if (!combined[current.id] && current.district.match(/\-1$/)) {
          combined[current.id] = await getShapeFiles(2016, `${current.state}-0`);
        }

        if( combined[current.id] ) {
          combined[current.id].id = current.id
        }

      } catch(e) {
        console.error(`Could not retrieve ${current.district}`)
        console.error(district)
      }

    setTimeout(() => getDistricts(raw, combined), 150);
  } else {
    fs.writeFileSync(
      "./src/districts.json",
      JSON.stringify(topojson.topology(combined, 0))
    );
  }
};

(() => {
  getDistricts(JSON.parse(fs.readFileSync(districts_file, "utf-8")));
})();

module.exports = getShapeFiles;
