# React + Sass + Browserify + Gulp Project

Minimal sample project for React using the code from 'Thiking in React'.

It uses `gulp` as the build system, `sass` for stylesheets, `browserify` to
bundle all the javascript code, and `reactify` to transform the JSX files.

For development the gulp project uses `watchify` to rebuild the
javascript bundle when code is updated, `connect` to host a webserver,
and `livereload` to refresh the browser to reflect any changes.

    ├── README.md
    ├── gulpfile.js
    ├── package.json
    └── src
        ├── index.html
        ├── jsx
        │   ├── filterableproducttable.jsx
        │   ├── main.jsx
        │   ├── producttable.jsx
        │   └── searchbar.jsx
        └── scss
            └── style.scss

## Building

This project requires node and npm to be installed on your system.

1. Install gulp globally

    npm install -g gulp

2. Install project dependencies

    npm install

3. Run project in debug mode (with livereload)

    gulp

  Open http://localhost:8888 in your browser.

## Deploying

To generate minified html, css and javascript files use:

   npm run dist
