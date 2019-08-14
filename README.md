# Data maps

For development:

```
$ yarn run dev
```

To deploy:

```
$ yarn run deploy
```

# Setting up the Google Sheet

In order for this to work, you need to set up your Google Sheet in a particular way.

### Settings

The first tab should be a settings tab. The following columns are required:

- `Issue`: This is a key that will be used to link content from the content tab, e.g. `avr`.
- `Issue label`: The longform version of the issue or data set, e.g. `Automatic voter registration`.
- `Dataset`: One of `State`, `House`, or `NY State House`
- `Tab`: The tab with the data on it.
-

These are optional columns that you can have for extra configuration:

- `Title`: The title that will be displayed at the top of the map. If empty, it will default to `Support for [issue label]`.
- `Legend label`: Override the label on the legend.
- `Min`: A decimal between 0 and 1. If empty, it will be 0.
- `Max`: A decimal between 0 and 1. If empty, it will be 1.
- `Scale`: The type of scale to use. Options:
  - `red`: Linear scale from light red to dark red.
  - `blue`: Linear scale from light blue to dark blue.
  - `red-to-blue`: Divergent scale from red to blue. Must be an odd number; middle is automatically set to gray.
  - `blue-to-red`: Divergent scale from blue to red. Must be an odd number; middle is automatically set to gray.
  - `red-inverted`: Linear scale from dark red to light red.
  - `blue-inverted`: Linear scale from dark blue to light blue.
  - `dynamic`: If min is at or above .5, light blue to dark blue. If max is at or below .5, dark red to light red. Otherwise dark red to dark blue.
  - `dynamic-inverted`: If min is at or above .5, light blue to dark blue. If max is at or below .5, dark red to light red. Otherwise dark blue to dark red.
  - `qualitative`: Red, yellow and green. Used for evaluating quality of policies.
- `Buckets`: The number of buckets to divide the scale into. Defaults to 7. Options:
  - `red` and `blue`: A number between 3 and 8.
  - `red-to-blue` and `blue-to-red`: A number between 2 and 10.

### Content

The second tab of the sheet contains the content below the map. This tab should have these columns:

- `Issue`: One of the keys from the settings `Issue` column.
- `Content`: Markdown text.

## Data sheets

Every other sheet should correspond to a single dataset, where the number of the tab corresponds to the `Tab` value in the settings column.

These sheets have the following required columns:

- `Code`: This is what links data to a state or district. States use their FIPS code and districts use the state FIPS + district number. e.g. Arkansas 2nd district is `502` because Arkansas is `5` and district is `02`.
- `Label`: This will be displayed. It can be a state abbreviation, full name, or whatever.

Every other column on the sheet will be treated as a filter. It should have a decimal between 0 and 1 to show the percentage support for the issue.

In order for a column label to show up as multiple words, use dashes: e.g. `independent-voters`.

The sheet can have an optional `content` column that will be displayed in the details pane. Markdown is supported.
