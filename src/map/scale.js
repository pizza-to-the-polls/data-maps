import * as d3 from "d3";
import { qualKeys, RED_SCALE, BLUE_SCALE, QUALITATIVE_SCALE, INVERTED_SCALE } from "../constants";

export const getMapScale = (scaleType, domain, buckets) => {
  const colorSchemeIndex = buckets + 1; // Account for 0-indexing

  if (scaleType === QUALITATIVE_SCALE) {
    const qualMapScale = {};
    qualKeys.map(key => {
      qualMapScale[key] = `url(#${key})`;
    });

    return value => qualMapScale[value];
  }
  if (scaleType === INVERTED_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeRdBu[colorSchemeIndex].reverse());
  }
  if (scaleType === BLUE_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeBlues[colorSchemeIndex]);
  }
  if (scaleType === RED_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeReds[colorSchemeIndex]);
  }
  return d3.scaleQuantize(domain, d3.schemeRdBu[colorSchemeIndex]);
};

export const getLegendScale = () => {
  const qualLegendScale = {};
  qualKeys.map(key => {
    qualLegendScale[key] = `${key}.svg`;
  });
  return qualLegendScale;
};
