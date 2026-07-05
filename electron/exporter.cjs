const path = require('node:path')
const fsp = require('node:fs/promises')
const fs = require('node:fs')

function slugify(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'article'
  )
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Writes a fully self-contained static article bundle:
 *   <destRoot>/<projectName-slug>/
 *     index.html   (project JSON inlined as window.__ARTICLE_DATA__)
 *     viewer.js    (prebuilt IIFE bundle of the shared render components)
 *     viewer.css
 *     assets/      (copied from the project folder)
 * Opening index.html directly from file:// renders the interactive article.
 */
async function writeExport(project, projectDir, destRoot, viewerDist) {
  const dest = path.join(destRoot, slugify(project.projectName))
  await fsp.mkdir(dest, { recursive: true })

  const assetsSrc = path.join(projectDir, 'assets')
  if (fs.existsSync(assetsSrc)) {
    await fsp.cp(assetsSrc, path.join(dest, 'assets'), { recursive: true })
  }

  await fsp.copyFile(path.join(viewerDist, 'viewer.js'), path.join(dest, 'viewer.js'))
  const cssSrc = path.join(viewerDist, 'viewer.css')
  const hasCss = fs.existsSync(cssSrc)
  if (hasCss) {
    await fsp.copyFile(cssSrc, path.join(dest, 'viewer.css'))
  }

  // <-escape so a "</script>" inside essay text cannot break out of the tag.
  const json = JSON.stringify(project).replace(/</g, '\\u003c')

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(project.projectName)}</title>
    ${hasCss ? '<link rel="stylesheet" href="viewer.css" />' : ''}
    <style>body { margin: 0; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script>window.__ARTICLE_DATA__ = ${json};</script>
    <script src="viewer.js"></script>
  </body>
</html>
`
  await fsp.writeFile(path.join(dest, 'index.html'), html, 'utf-8')
  return dest
}

module.exports = { writeExport, slugify }
