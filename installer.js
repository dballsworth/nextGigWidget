const scriptURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/nextGigWidget.js";
const scriptName = "nextGigWidget";

async function downloadScript(url, name) {
    let fm = FileManager.iCloud();
    let path = fm.joinPath(fm.documentsDirectory(), `${name}.js`);

    let req = new Request(url);
    let scriptContent = await req.loadString();

    fm.writeString(path, scriptContent);
    console.log(`Script saved to ${path}`);
    return path;
}

let scriptPath = await downloadScript(scriptURL, scriptName);
Safari.open(`scriptable:///run/${encodeURIComponent(scriptName)}`);
