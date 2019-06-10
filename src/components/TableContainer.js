import { h } from "preact";

import { prefix } from "../constants";

const TableContainer = () => (
  <details className={`${prefix}table-container`} >
    <summary>Table</summary>
    <div className={`${prefix}table`} >
    </div>
  </details>
)

export default TableContainer;
