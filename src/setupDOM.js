import { select } from "d3";
import { prefix } from "constants";

function setupDOM() {
  const wrapper = select("#dfp-map-wrapper")
    .append("div")
    .attr("class", `${prefix}container`);

  const header = wrapper.append("h1").attr("id", `${prefix}header`);
  const controls = wrapper.append("div").attr("id", `${prefix}controls`);
  const figure = wrapper.append("figure").attr("id", `${prefix}vis`);
  const details = wrapper.append("details").attr("class", `${prefix}table-container`);
  const content = wrapper.append("section").attr("id", `${prefix}content`);
}

export default setupDOM;
