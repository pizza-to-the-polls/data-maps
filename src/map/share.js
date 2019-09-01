import { select } from "d3";

import html2canvas from "html2canvas";
import { prefix, QUALITATIVE_SCALE } from "../constants";
import { toggleLoading, toggleShare } from "../content";
import { buildURL } from "../utils";

export const addShare = (shareState) => {

  select(`.${prefix}share-button`).on("click", () => {
    if( shareState.scaleType === QUALITATIVE_SCALE ) {
      return toggleShare(true, false, shareState)
    }

    const elem = document.querySelector(`.${prefix}vis`);
    const parent = elem.parentNode;
    const copy = document.querySelector(`.${prefix}vis`).cloneNode(true);
    parent.insertBefore(copy, elem);
    toggleLoading(true, copy);

    elem.classList.add("generating-screenshot");

    const mapSVG = elem.querySelector(`.${prefix}map svg`);
    mapSVG.setAttribute(
      "width",
      window.innerWidth > 660 && elem.querySelector(".dfp-map__details").style.display === "block"
        ? 775
        : 990
    );
    mapSVG.setAttribute("height", 600);

    const legendSVG = elem.querySelector(`.${prefix}legend svg`);
    if( legendSVG ) {
      legendSVG.setAttribute("width", legendSVG.getBBox().width * 10);
      legendSVG.setAttribute("viewBox", "0 0 320 40");
    }

    html2canvas(elem).then(canvas => {
      mapSVG.removeAttribute("width");
      mapSVG.removeAttribute("height");
      toggleLoading(false);
      toggleShare(true, canvas.toDataURL("image/png"), shareState);
      elem.classList.remove("generating-screenshot");
      if( legendSVG ) {
        legendSVG.removeAttribute('width');
        legendSVG.setAttribute("viewBox", "0 0 320 40");
      }
      parent.removeChild(copy);
    });
  });
};
