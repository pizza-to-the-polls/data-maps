#!/usr/bin/env node

const mapshaper = require("../node_modules/mapshaper/mapshaper.js");
const fs = require("fs");

const storage = `./states/`;

const mergeShapes = (combined, names, paths, simplify=true) => {
  if (!fs.existsSync(paths[0])) {
    console.error(`Could not find ${paths[0]}`)
    return
  }
  args = `-i ${paths.join(" ")}
          snap combine-files \
          -rename-layers ${names.join(",")} \
          -merge-layers target=${names.join(",")} name=${combined} \
          ${simplify ? '-simplify weighted 3%' : ''} \
          -o ${storage}${combined}.json format=topojson target=${combined} bbox force`;

  return new Promise((resolve, reject) =>
    mapshaper.runCommands(args.split(" ").filter(line => line), err => {
      if (err) reject(err);
      else resolve();
    })
  );
};

const collectStates = () => {
  const years = [2016, 2018];
  const states = {};

  years.forEach(year => {
    const base = `/Users/duncombe/Desktop/districts-gh-pages/cds/${year}/`;
    fs.readdirSync(base).filter(item => !item.includes('DS_Store')).forEach(item => {
      const state = item.split("-")[0];
      states[state] = states[state] || {};
      states[state][item] = `${base}${item}/shape.geojson`;
    });
  });

  return states;
};

const combineDistricts = async () => {
  const ids = JSON.parse(fs.readFileSync("./scripts/districts.json", "utf-8"));
  const states = collectStates();

  await Promise.all(Object.keys(states).map(async state => (
    await mergeShapes(state, Object.keys(states[state]), Object.values(states[state]))
  )));

  await mergeShapes('districts', Object.keys(states), Object.keys(states).map(state => (`${storage}${state}.json`)), false);

  const us = JSON.parse(fs.readFileSync(`${storage}districts.json`));

  us.objects.districts.geometries = us.objects.districts.geometries.map(obj => {
    const { Code } = obj.properties;
    const state = Code.split('-')[0];
    const num = Code.includes('-AL') ? 1 : parseInt(Code.match(/\d./))
    const { id } = ids.find(id => id.district === `${state}-${num}` )

    return {
      id: parseInt(id),
      ...obj
    }
  })

  fs.writeFileSync(
    './src/data/districts.json',
    JSON.stringify(us)
  );
}

combineDistricts()
