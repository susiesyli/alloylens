# AlloyLens

## Introduction

AlloyLens is an interactive visualization tool for visualizing and exploring high dimensional, high throughput alloy data. AlloyLens uses a novel framework to allow for real-time steering and exploration of data for inverse material design.

### Python

Installation with `pip`

```
pip install alloylens
```

### Usage:

```python
import alloylens as al

# Load alloy dataset

df = pd.read_csv("./Rapid_Alloy_development.txt")

# Define feature groups

all_cols = df.columns.tolist()
element_cols = all_cols[6:18]
microstructure_cols = all_cols[18:56]
property_cols = all_cols[56:70]

groups = {
"elements": element_cols,
"microstructures": microstructure_cols,
"properties": property_cols,
}

# Run alloylens

app = al.AlloyLensApp(df, groups, x="elements", y="properties")
app

```

`pip install alloylens`
