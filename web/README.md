# AlloyLens web demo

The source for the web demo at [susiesyli.com/alloylens-web/](https://susiesyli.com/alloylens-web/).

## Run locally

The site is static, so any file server works. From this folder:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

Pushing changes under `web/` to `main` runs [`deploy-web.yml`](../.github/workflows/deploy-web.yml), which publishes this folder to the site.
