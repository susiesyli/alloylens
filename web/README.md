# AlloyLens webapp

The source for the web demo at [susiesyli.com/alloylens-web/](https://susiesyli.com/alloylens-web/).

## Run locally

The site is static, so any file server works. From this folder:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

Pushing changes under `web/` to `main` runs [`deploy-web.yml`](../.github/workflows/deploy-web.yml), which publishes `index.html`, `tutorial.html`, `ui.css`, and `webapp/` to the site.

## Other files

`app.py` is an optional FastAPI backend for the surrogate model. It isn't used by the published site, and it needs the full contest dataset in `dataset/`, which isn't included in this repository.
