// jshint -W119

let scriptName = 'AutoUpdateExample';
let scriptUrl = 'https://raw.githubusercontent.com/dballsworth/nextGigWidget/refs/heads/main/autoupdate/yourScript.js';

let modulePath = await downloadModule(scriptName, scriptUrl); // jshint ignore:line
console.log('Module path: ' + modulePath);
if (modulePath != null) {
  let importedModule = importModule(modulePath);
  await importedModule.main(); // jshint ignore:line
} else {
  console.log('Failed to download new module and could not find any local version..');
}

async function downloadModule(scriptName, scriptUrl) {
  // returns path of latest module version which is accessible
  let fm = FileManager.local();
  let scriptPath = module.filename;
  let moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), scriptName);
  if (fm.fileExists(moduleDir) && !fm.isDirectory(moduleDir)) fm.remove(moduleDir);
  if (!fm.fileExists(moduleDir)) fm.createDirectory(moduleDir);
  let dayNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24);
  let moduleFilename = dayNumber.toString() + '.js';
  let modulePath = fm.joinPath(moduleDir, moduleFilename);
  if (fm.fileExists(modulePath)) {
    let fileInfo = fm.fileInfo(modulePath);
    let lastModified = new Date(fileInfo.modified);
    let now = new Date();
    let diffInSeconds = (now - lastModified) / 1000;
    if (diffInSeconds <= 60) {
      console.log('Module already downloaded ' + moduleFilename);
      return modulePath;
    }
  }
  let [moduleFiles, moduleLatestFile] = getModuleVersions(scriptName);
  console.log('Downloading ' + moduleFilename + ' from URL: ' + scriptUrl);
  let req = new Request(scriptUrl);
  let moduleJs = await req.load().catch(() => {
    return null;
  });
  if (moduleJs) {
    // console.log the moduleJs last modified date from GitHub
    let lastModified = req.responseHeaders['Last-Modified'];
    if (lastModified) {
      console.log('Module downloaded ' + moduleFilename + ' from URL: ' + scriptUrl + ' - Last Modified: ' + lastModified);
    } else {
      console.log('Module downloaded ' + moduleFilename + ' from URL: ' + scriptUrl + ' - Last Modified date not available');
    }
    fm.write(modulePath, moduleJs);
    if (moduleFiles != null) {
      moduleFiles.map(x => {
        fm.remove(fm.joinPath(moduleDir, x));
      });
    }
    return modulePath;
  } else {
    console.log('Failed to download new module. Using latest local version: ' + moduleLatestFile);
    return (moduleLatestFile != null) ? fm.joinPath(moduleDir, moduleLatestFile) : null;
  }
}

function getModuleVersions(scriptName) {
  // returns all saved module versions and latest version of them
  let fm = FileManager.local();
  let scriptPath = module.filename;
  let moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), scriptName);
  let dirContents = fm.listContents(moduleDir);
  if (dirContents.length > 0) {
    let versions = dirContents.map(x => {
      if (x.endsWith('.js')) return parseInt(x.replace('.js', ''));
    });
    versions.sort(function(a, b) {
      return b - a;
    });
    versions = versions.filter(Boolean);
    if (versions.length > 0) {
      let moduleFiles = versions.map(x => {
        return x + '.js';
      });
      moduleLatestFile = versions[0] + '.js';
      return [moduleFiles, moduleLatestFile];
    }
  }
  return [null, null];
}