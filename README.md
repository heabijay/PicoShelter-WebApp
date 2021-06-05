# PicoShelter-WebApp

<p align="center">
    <img src="https://www.picoshelter.tk/assets/icons/picoShelter/Black%20Icon%20%2B%20Text.svg" height="64px">
</p>

The client part on Angular of the PicoShelter Project.

## About PicoShelter Project

_"PicoShelter is a free image hosting service with user profiles, shared albums, and direct links. Also, we provide the official desktop application for a more comfortable experience."_

PicoShelter's [ApiServer](https://github.com/heabijay/PicoShelter-ApiServer), [WebApp](https://github.com/heabijay/PicoShelter-WebApp), [DesktopApp](https://github.com/heabijay/PicoShelter-DesktopApp) were created by [heabijay](https://github.com/heabijay) as the diploma project.

## Demo

This project demo currently serves on Azure Static Web App (Free Plan) since 05.05.2021.

**Home page:** [picoshelter.tk](https://www.picoshelter.tk)

**Home page (original url by Azure):** [wonderful-sand-0ac999f03.azurestaticapps.net](https://wonderful-sand-0ac999f03.azurestaticapps.net)

_Due to the free plan on Azure App Service (for ApiServer), the server isn't alive all time so the first request could take some time._


## Screenshots
<details>
    <summary>Click to show</summary>

### Home page
![](https://i.imgur.com/tVGGXQO.png)

### User's own profile
![](https://i.imgur.com/tO44clh.png)

### User's profile
![](https://i.imgur.com/IZ3P7Wi.png)

### Upload page
![](https://i.imgur.com/fU1o3cm.png)

### Image page
![](https://i.imgur.com/fkEGcsa.png)

### Album page
![](https://i.imgur.com/cjSAkBK.png)

### Apps page
![](https://i.imgur.com/gn5COrk.png)
</details>

## Configuration

The only configuration that you need, is server endpoint configuration in file `src/app/abstract/httpService.ts:3`.

Also, there are some interesting assets paths:

- `src/assets/files/PicoShelter-DesktopApp.exe` — the desktop application release for route `/apps`. 

    _**Note:** If you replace the executable file, the version shouldn't change: you must do manual edit in `src/app/apps/apps.component.html`_

- `src/assets/locale/*` — localization files. Currently English and Ukrainian language support.