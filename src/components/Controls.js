import { h, Component } from "preact";

import { prefix } from "../constants";

const Controls = () => (
  <div className={`${prefix}controls`} >
    {["selector", "filters", "toggle"].map(name => (
      <div className={`${prefix}${name} ${prefix}control`} >
      </div>
    ))}
  </div>
)

export default Controls;
