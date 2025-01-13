import path from 'path';
import fs from "fs";
import { src, dest, watch, series } from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import terser from "gulp-terser";
import sharp from "sharp";
import { glob } from "glob";

const sass = gulpSass(dartSass);

function css() {
  return src('src/scss/app.scss', { sourcemaps: true })
    .pipe(sass({ style: "compressed" }).on('error', sass.logError))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
}

function js() {
  return src('src/js/app.js')
    .pipe(terser())
    .pipe(dest('dist/js'));
}

export async function imagenes(done) {
  const srcDir = './src/img';
  const buildDir = './dist/img';
  const images = await glob('./src/img/**/*{jpg,png}')

  images.forEach(file => {
    const relativePath = path.relative(srcDir, path.dirname(file));
    const outputSubDir = path.join(buildDir, relativePath);
    procesarImagenes(file, outputSubDir);
  });
  done();
}

function procesarImagenes(file, outputSubDir) {
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true })
  }
  const baseName = path.basename(file, path.extname(file))
  const extName = path.extname(file)
  const outputFile = path.join(outputSubDir, `${baseName}${extName}`)
  const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`)
  const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`)

  const options = { quality: 80 }
  sharp(file).jpeg(options).toFile(outputFile)
  sharp(file).webp(options).toFile(outputFileWebp)
  sharp(file).avif().toFile(outputFileAvif)
}

function dev() {
  watch('src/scss/**/*.scss', css);
  watch('src/js/**/*.js', js);
  watch('src/img/**/*.{png,jpg}', imagenes);
}

export default series(imagenes, css, js, dev);