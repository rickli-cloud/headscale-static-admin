# Headscale admin

![issues](https://img.shields.io/github/issues/rickli-cloud/headscale-admin)
![build](https://img.shields.io/github/actions/workflow/status/rickli-cloud/headscale-admin/check.yaml)
![release](https://img.shields.io/github/v/release/rickli-cloud/headscale-admin)
![commits_since](https://img.shields.io/github/commits-since/rickli-cloud/headscale-admin/latest)

Fully featured web application to manage your headscale instance over the API.

## Install

> Depending on the configuration you might encounter CORS issues.

### Docker

For a full example using traefik as reverse proxy see `docker-compose.yaml`.

```yaml
version: '3.8'

services:
  headscale-admin:
    image: ghcr.io/rickli-cloud/headscale-admin
    container_name: headscale-admin
    pull_policy: always
    restart: always
    read_only: true
    ports:
      - 80:80/tcp
```

### Static content

You can download a build on the release page.

### Build your own

Configure environment

> If you do not want to serve the app on the `/admin` path you need to change `BASE_PATH`.

```sh
cp example.env .env
```

Install & build

```sh
npm install
npm run build
```

### Just want it running

Requires nodejs & npm.

> In dev mode vite will spin up a proxy to work around cors issues. Do not change the API host on the login page.

```sh
git clone https://github.com/rickli-cloud/headscale-admin/
npm install
export HEADSCALE_HOST=https://your.headscale.instance
npm run dev
```
