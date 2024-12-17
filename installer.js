const scriptURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/nextGigWidget.js";
const imageURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/dblogo.jpeg";

const scriptName = "nextGigWidget";
const imageName = "dblogo";

async function downloadFile(url, name, extension) {
    let fm = FileManager.iCloud();
    let path = fm.joinPath(fm.documentsDirectory(), `${name}.${extension}`);

    let req = new Request(url);
    let fileContent = await req.load();

    fm.write(path, fileContent);
    console.log(`File saved to ${path}`);
    return path;
}

let scriptPath = await downloadFile(scriptURL, scriptName, "js");
let imagePath = await downloadFile(imageURL, imageName, "jpeg");

Safari.open(`scriptable:///run/${encodeURIComponent(scriptName)}`);
