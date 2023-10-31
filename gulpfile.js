// @ts-check
import gulp from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import concat from "gulp-concat";
import terser from "gulp-terser";
import browserSync from "browser-sync";
import autoPrefixer from "gulp-autoprefixer";
import clean from "gulp-clean";
import sourcemaps from "gulp-sourcemaps";
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin";
import ts from "gulp-typescript";
import pug from "gulp-pug";
import { rollup } from "rollup";
import rollupTypescript from "@rollup/plugin-typescript";

const { src, dest, watch, parallel, series } = gulp;
const sass = gulpSass(dartSass);
const tsProject = ts.createProject("tsconfig.json");

// минификация js
function convertJS() {
  return src([
    //"node_modules/jquery/dist/jquery.min.js",
    "src/assets/js/main.js",
  ])
    .pipe(sourcemaps.init())
    .pipe(concat("main.min.js"))
    .pipe(terser())
    .pipe(sourcemaps.write("."))
    .pipe(dest("src/assets/js"))
    .pipe(browserSync.stream());
}

// бандлер rollup
function bundleTS() {
  return rollup({
    input: "src/index.ts",
    plugins: [rollupTypescript()],
  }).then((bundle) => {
    return bundle.write({
      file: "src/assets/js/main.js",
      format: "es",
    });
  });
}

// конверация  и минификация стилей
function convertStyles() {
  return src("src/style.scss")
    .pipe(sourcemaps.init())
    .pipe(autoPrefixer())
    .pipe(concat("style.min.css"))
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(sourcemaps.write("."))
    .pipe(dest("src/assets/css"))
    .pipe(browserSync.stream());
}

// оптимизация изображений
function convertImages() {
  return src("src/img/**/*")
    .pipe(
      imagemin([
        gifsicle({ interlaced: true }), mozjpeg({ quality: 75, progressive: true }), optipng({ optimizationLevel: 5 }), svgo({ plugins: [
            {
              name: "removeViewBox",
              active: true,
            },
            {
              name: "cleanupIDs",
              active: false,
            },
          ],
        }),
      ]),
    )
    .pipe(dest("src/assets/img"))
    .pipe(browserSync.stream());
}

// конвертация из pug в html
function convertPugToHtml() {
  return src("src/index.pug")
    .pipe(pug({ pretty: true }))
    .pipe(dest("src/"))
    .pipe(browserSync.stream());
}

// инициализация browser-sync
function browserSyncInit() {
  browserSync.init({
    server: {
      baseDir: "src",
    },
  });
}

// обновление страницы при изменении файлов
function watchFiles() {
  // watch("src/index.js", convertJS);
  watch("src/**/*.pug", convertPugToHtml);
  watch("src/**/*.ts", createJS);
  watch("src/**/*.scss", convertStyles);
  watch("src/img/**/*", convertImages);
  watch("src/*.html").on("change", browserSync.reload);
}

// удаление dist
function cleanDist() {
  return src("dist", { read: false, allowEmpty: true }).pipe(clean());
}

// создание dist
function buildDist() {
  return src(
    [
      "src/**/*.html",
      "!src/html/**/*.html",
      "src/assets/css/style.min.css",
      "src/assets/js/main.min.js",
      "src/assets/img/**/*",
      "src/assets/fonts/**/*",
    ],
    {
      base: "src",
    },
  ).pipe(dest("dist"));
}

const createJS = series(bundleTS, convertJS)

export const build = series(cleanDist, buildDist);
export default parallel(
  createJS,
  convertPugToHtml,
  convertStyles,
  convertImages,
  browserSyncInit,
  watchFiles,
);
