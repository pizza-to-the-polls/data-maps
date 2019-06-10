import { h, Component } from "preact";

import Content from "./Content";
import Controls from "./Controls";
import TableContainer from "./TableContainer";
import Vis from "./Vis";

import { fetchMap, fetchSheet } from "../fetch";
import { buildDatasets, buildContent } from "../data";
import { prefix } from "../constants";

class App extends Component {
  constructor() {
    super();

    this.state = {
      maps: {},
      sheets: {},
      datasets: {},
      set: false,
      sheetKey: false
    };
  }

  loadMap(mapKey) {
    // Will only attempt to load a map once.
    const { maps } = this.state;
    if (maps[mapKey]) return;

    this.setState({ maps: { ...maps, ...{ [mapKey]: {} }} }, () => {
      fetchMap(mapKey, geojson => {
        const { maps } = this.state;
        this.setState({ maps: { ...maps, ...{ [mapKey]: geojson } } });
      });
    });
  }

  loadSheet(tab, callback) {
    // Will only attempt to load a sheet once.
    const { sheetKey } = this.props;
    const { sheets } = this.state;
    if (sheets[tab]) return;

    this.setState({ sheets: { ...sheets, ...{ [tab]: {} } } }, () =>
      fetchSheet(
        tab,
        sheetKey,
        callback ||
          (raw => {
            const { sheets } = this.state;
            this.setState({ sheets: { ...sheets, ...{ [tab]: raw } } });
          })
      )
    );
  }

  componentWillMount() {
    this.loadMap("state");

    // Sheet 1 must always be settings
    this.loadSheet(1, raw => {
      const datasets = buildDatasets(raw);
      Object.values(datasets)
        .flatMap(dataset => Object.keys(dataset.sheets))
        .forEach(map => this.loadMap(map), this);

      const set = Object.keys(datasets)[0];
      const sheetKey = datasets[set].defaultSheet;

      this.setState({ sheetKey, set, datasets });
    });

    // Sheet 2 must always be content
    this.loadSheet(2, raw => this.setState({ content: buildContent(raw) }));
  }

  render(props, state) {
    const { sheetKey, set, datasets, maps, sheets, content } = this.state;

    const dataset = datasets[set];
    const datasetsheet = dataset ? dataset.sheets[sheetKey] : null;
    const sheet = datasetsheet ? sheets[datasetsheet.tab] : null;
    const map = datasetsheet ? maps[datasetsheet.map] : null;

    // If a sheet hasn't been loaded - load that sheet.
    if (!sheet && datasetsheet) this.loadSheet(datasetsheet.tab);

    return (
      <div className={`${prefix}container`}>
        <Vis sheetKey={sheetKey} dataset={dataset} map={map} sheet={sheet} />
        <Controls />
        <TableContainer />
        {set && content && (<Content content={content[set]} />)}
      </div>
    );
  }
}

export default App;
