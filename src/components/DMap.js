import { h } from "preact";

import { prefix } from "../constants";

const DMap = ({ sheetKey, map, sheet, dataset }) => {
  const datasetsheet = dataset.sheets[sheetKey];
  return (
    <div className={`${prefix}map`}>
      <svg className={`${prefix}map-svg`} viewBox="0 0 960 600" />
      <span className={`${prefix}click-instructions`}>{
        `Click a ${datasetsheet.map === "state" ? "state" : "district"} for details`
      }</span>
    </div>
  )
};

export default DMap;
