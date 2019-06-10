import { h } from "preact";

import { prefix } from "../constants";

const Loader = ({ isLoading }) => (
  <div className={`${prefix}loader`} style={{ display: isLoading ? "block" : "none" }}>
    <div className="bar" />
    <div className="bar" />
    <div className="bar" />
    <div className="bar" />
  </div>
);

export default Loader;
