import * as d3 from "d3";
import { quantitativeColors, qualKeys } from "../constants";

export const getMapScale = (scaleType, domain) => {
  if (scaleType === "qualitative") {
    const qualMapScale = {};
    qualKeys.map(key => {
      qualMapScale[key] = `url(#${key})`;
    });

    return value => qualMapScale[value];
  }
  if (scaleType === "invertedquantitative") {
    return d3.scaleQuantize(domain, quantitativeColors.reverse());
  }
  return d3.scaleQuantize(domain, quantitativeColors);
};

export const getLegendScale = () => {
  const qualLegendScale = {};
  qualKeys.map(key => {
    qualLegendScale[key] = `${key}.svg`;
  });
  return qualLegendScale;
};
