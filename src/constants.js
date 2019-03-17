export const sheetsBaseUrl = 'https://spreadsheets.google.com/feeds/list';
export const sheetsID = '1loELb4aslMLnvzdU7mMz75iz11OyDblZZSRcINnukYk';
export const statesURL = '/data/us.json';
export const districtsURL = '/data/us-congress-113.json';
export const excludedKeys = ['id', 'fips', 'type', 'properties', 'geometry', 'label'];
export const defaultFilter = 'overall';
export const labelMap = {
  clintonvoters: 'Clinton voters',
  trumpvoters: 'Trump voters',
  independentvoters: 'Independent voters',
  nonvoters: 'Non-voters',
  overall: 'Overall',
  label: 'Location',
  state: 'State',
  house: 'House district',
};
