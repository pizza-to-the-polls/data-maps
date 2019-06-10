import { h } from "preact";

import { prefix } from "../constants";

import DMap from "./DMap"
import Legend from "./Legend"
import Loader from "./Loader"

const Vis = ({ sheetKey, map, sheet, dataset }) => (
  <figure className={`${prefix}vis`} >
    <h1 className={`${prefix}header`}>{dataset && dataset.title}</h1>
    {sheetKey && (<DMap sheetKey={sheetKey} map={map} sheet={sheet} dataset={dataset} />)}
    <Legend />
    <Loader isLoading={!map || !sheet} />
  </figure>
)

export default Vis;
