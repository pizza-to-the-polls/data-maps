import * as d3 from "d3";
import {
  qualKeys,
  RED_SCALE,
  BLUE_SCALE,
  QUALITATIVE_SCALE,
  INVERTED_SCALE,
  DYNAMIC_SCALE,
  INVERTED_RED_SCALE,
  INVERTED_BLUE_SCALE,
  INVERTED_DYNAMIC_SCALE,
  DIVERGENT_SCALE
} from "../constants";

export const getDomain = (data, setMin, setMax) => {
  const max = Math.max.apply(null, data);
  const min = Math.min.apply(null, data);

  const domain = [];
  if (setMin) {
    domain.push(setMin);
  } else {
    domain.push(
      min < 0
        ? min < -1
          ? -100
          : -1 // Assume equal distribution around zero
        : 0 // Assume floor is zero
    );
  }
  if (setMax) {
    domain.push(setMax);
  } else {
    domain.push(max > 1 ? 100 : 1);
  }
  return domain;
};

const getMinAndMax = data => {
  const min = Math.floor(Math.min.apply(null, data) * 10) / 10;
  const max = Math.ceil(Math.max.apply(null, data) * 10) / 10;
  return { min, max };
};

const findMiddlePoint = length => {
  return Math.floor(length / 2);
};

const setMidpointToGray = scheme => {
  scheme.splice(findMiddlePoint(scheme.length), 1, "#f7f7f7");
  return scheme;
};

export const getDynamicDomain = data => {
  // Calculate the dynamic range:
  // 1. If all numbers are above or below .5, then just use the natural min and max from the dataset
  // 2. If the min and max are on either side of .5, then take whichever is further from .5 and use
  //    that to set the scale. So if the min is .4 and max is .8, adjust the domain to be [.2, .8]
  const { min, max } = getMinAndMax(data);
  if ((min <= 0.5 && max <= 0.5) || (min >= 0.5 && max >= 0.5)) {
    return [min, max];
  }
  const maxFromHalf = max - 0.5;
  const minFromHalf = 0.5 - min;
  const newMax = maxFromHalf > minFromHalf ? max : 0.5 + minFromHalf;
  const newMin = minFromHalf > maxFromHalf ? min : 0.5 - maxFromHalf;
  return [newMin, newMax];
};

export const getDynamicColorScheme = (domain, scaleType) => {
  if (scaleType === INVERTED_DYNAMIC_SCALE) {
    if (domain[1] <= 0.5) {
      // If min and max are both below .5 go dark blue to light blue
      return INVERTED_BLUE_SCALE;
    }
    if (domain[0] >= 0.5) {
      // If min is over .5 go light red to dark red
      return RED_SCALE;
    }
    return INVERTED_SCALE;
  }
  if (domain[1] <= 0.5) {
    // If min and max are both below .5 go dark red to light red
    return INVERTED_RED_SCALE;
  }
  if (domain[0] >= 0.5) {
    // If min is over .5 go light blue to dark blue
    return BLUE_SCALE;
  }
  return DIVERGENT_SCALE;
};

export const getMapScale = ({ scaleType, buckets, setMin, setMax }, data) => {
  const colorSchemeIndex = buckets; // Account for 0-indexing
  let domain = [];
  let colorScheme;
  if (scaleType === DYNAMIC_SCALE || scaleType === INVERTED_DYNAMIC_SCALE) {
    domain = getDynamicDomain(data);
    colorScheme = getDynamicColorScheme(domain, scaleType);
  } else {
    domain = getDomain(data, setMin, setMax);
    colorScheme = scaleType;
  }
  if (colorScheme === QUALITATIVE_SCALE) {
    const qualMapScale = {};
    qualKeys.map(key => {
      qualMapScale[key] = `url(#${key})`;
    });

    return value => qualMapScale[value];
  }
  if (colorScheme === INVERTED_SCALE) {
    return d3.scaleQuantize(domain, setMidpointToGray(d3.schemeRdBu[colorSchemeIndex].reverse()));
  }
  if (colorScheme === BLUE_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeBlues[colorSchemeIndex]);
  }
  if (colorScheme === RED_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeReds[colorSchemeIndex]);
  }
  if (colorScheme === INVERTED_RED_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeReds[colorSchemeIndex].reverse());
  }
  if (colorScheme === INVERTED_BLUE_SCALE) {
    return d3.scaleQuantize(domain, d3.schemeBlues[colorSchemeIndex].reverse());
  }
  return d3.scaleQuantize(domain, setMidpointToGray(d3.schemeRdBu[colorSchemeIndex]));
};

export const getLegendScale = () => {
  const qualLegendScale = {};
  qualKeys.map(key => {
    qualLegendScale[key] = `${key}.svg`;
  });
  return qualLegendScale;
};
