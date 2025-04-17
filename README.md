# Scientific Data App

This is the scientific data app. It has the license of GNU GPLv3 and it is provided as-is. "Batteries not included", please be mindful of the licenses for data you render with this software. This program can work fully offline.


## It supports the following data file formats:
- geoJSON - USGS Earthquakes
- CSV - National Centers for Environmental Information
- CSV - Kaggle Scientific CSV

If you'd like a specific format for your data to be supported, please open an **issue** on this repository for any special formats that need fine-tuning for headers.

## Instructions to use:

```sh
# Install dependencies:
npm install
# Run the development version 
npm run start

```
## With the application running:

You'll need to set a folder to view from, where it can load any number of data files from that data folder. Afterwards, it is possible to select a file to look at from the input menu, and render graphics related to that data. It supports loading charts with ChartJS, and can handle large files.

## Instructions to build it:

```sh
# Builds the version of the package builder (Mac or Windows):
npm run build
```

## Visual details as screenshots:
![Scientific Data App Screenshot](./screenshots/scientific-data-app-screenshot-1.jpg)

![Scientific Data App Screenshot 2](./screenshots/scientific-data-app-screenshot-2.jpg)

![Scientific Data App Screenshot 3](./screenshots/scientific-data-app-screenshot-3.jpg)

![Scientific Data App Screenshot 4](./screenshots/scientific-data-app-screenshot-4.jpg)

![Scientific Data App Screenshot 5](./screenshots/scientific-data-app-screenshot-5.jpg)
