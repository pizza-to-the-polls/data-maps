import { rootURL, qualKeys } from "../constants";

export const addQualPatterns = svg => {
  svg.append("defs");

  const p = 20;

  qualKeys.map(key =>
    svg
      .select("defs")
      .append("pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("id", key)
      .attr("width", p)
      .attr("height", p)
      .append("image")
      .attr("xlink:href", `${rootURL}${key}.svg`)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", p)
      .attr("height", p)
  );
};

export const toggleHoverPattern = (svg, shouldAdd) => {
  const defs = svg.select("defs");
  if (shouldAdd && defs.empty()) {
    svg
      .append("defs")
      .append("pattern")
      .attr("id", "hoverPattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 10)
      .attr("height", 10)
      .append("image")
      .attr(
        "xlink:href",
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PScxLjUnIGN5PScxLjUnIHI9JzEuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+Cg=="
      )
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10);

    svg
      .select("defs")
      .append("mask")
      .attr("id", "hoverMask")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#hoverPattern)");
  } else {
    defs.remove();
  }
};
