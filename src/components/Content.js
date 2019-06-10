import { h } from "preact";

import { prefix } from "../constants";
import marked from "marked";

const Content = ({ content }) => (
  <div className={`${prefix}content`} >
    <section dangerouslySetInnerHTML={{__html: marked(content)}}></section>
  </div>
)

export default Content;
