import { h } from "preact";

import { legendWidth, legendHeight, prefix } from "../constants";

const Legend = () => (
  <div className={`${prefix}legend`} >
    <span className={`${prefix}legend-label`} />
    <svg viewBox={`0 0 ${legendWidth} ${legendHeight}`} />
  </div>
)

export default Legend;
