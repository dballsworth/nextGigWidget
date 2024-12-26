//Purpose: This is an iOS widget script that downloads and then keeps in synch with the latest commit date of a file from a GitHub repository.
// here's how it works:
// 1. config at the top of the script makes this usable for any file or set of files in any repo
// 2. look locally for whether the file is installed at all and if so, when it was last updated
// 3. if it's not installed, install it
// 4. if it's installed, check the last modified date
// 5. if it's less than x seconds old, use the local version
// 6. if it's older than x seconds, check to see if we should download the latest version from GitHub
// 7. if if the version on GitHub is newer, download it and save it locally (otherwise just run the local version)
// 8. run the script
//
//
// CONFIGURATION
//
//
// Define the repository details
const owner = 'dballsworth';
const repo = 'nextGigWidget';
const branch = 'main';

// Define the file path to check for updates -- this is the path in GITHUB
const filePath = 'autoupdate/yourScript.js';
// define a list of dependent files to check for updates
const dependentFiles = ['dblogo.jpeg'];

// Construct the API URL to fetch the latest commit for the file
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branch}`;

// local things:

// Define the path to the current script on the users device
const scriptPath = module.filename;

// Define the refresh interval in seconds
//  if the script is less than this many seconds old, it will use the local version
const refreshInterval = 60;

// Define the subdirectory name to save the file on the users device
const subDirectoryName = 'autoupdate2';




// Function to fetch the last modified date from the API for the filePath (script)
async function fetchLastModifiedDateFromGitHub() {
    try {
        let req = new Request(apiUrl);
        req.headers = {
        'Accept': 'application/vnd.github.v3+json',
        // 'Authorization': 'Bearer YOUR_GITHUB_TOKEN' // Uncomment if accessing a private repo
        };
        let response = await req.loadJSON();
        if (response.length > 0) {
            let commitDate = response[0].commit.committer.date;
            console.log('GitHub commit date:', commitDate);
            return new Date(commitDate);
        } else {
            throw new Error('No commit data found for the specified file.');
        }
    } catch (error) {
        console.error('Error fetching commit data:', error);
        return null;
    }
}

// Function to format the date as YYYYMMDD_HHMMSS
function formatDate(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// Function to download and save the file with the modified date in the filename
async function downloadAndSaveFile() {
    const lastModifiedDate = await fetchLastModifiedDateFromGitHub();
    if (lastModifiedDate) {
        const formattedDate = formatDate(lastModifiedDate);
        const fileName = `yourScript_${formattedDate}.js`;
        const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

        try {
        let req = new Request(fileUrl);
        let fileContents = await req.load();
        const filePath = FileManager.local().joinPath(directoryPath, fileName);
        FileManager.local().write(filePath, fileContents);
        console.log(`File saved as ${fileName}`);
        } catch (error) {
            console.error('Error downloading or saving the file:', error);
            console.log('Error details:', error.message, error.stack);
            }
        } else {
            console.log('Unable to retrieve the last modified date.');
    }
}

// 2. look locally for whether the file autoupdate/yourScript.js is installed at all and if so, when it was last updated
function isFileInstalled(localDirPath) {
    //check and see if this directory exists
    let fm = FileManager.local();
    //check if the directory exists and if it does list all the files in it
    if (fm.isDirectory(localDirPath)) {
        let files = fm.listContents(localDirPath);
        //find any *.js files in this directory and return the last modified date
        let jsFiles = files.filter(file => file.endsWith('.js'));
        if (jsFiles.length > 0) {
            //return the last modified date of the first file found
            console.log(`File found: ${jsFiles[0]}`);
            return getFileLastModifiedDate(fm.joinPath(localDirPath, jsFiles[0]));
        } else {
            return false;
        }

        
    }
    
}

function getFileLastModifiedDate(filePath) {
    let fm = FileManager.local();
    if (fm.fileExists(filePath)) {
        console.log(`Last modified date: ${fm.modificationDate(filePath)}`);
        return fm.modificationDate(filePath);
    } else {
        return null;
    }
}

// Check if the file is installed locally and get its last modified date
let localFilePath = FileManager.local().joinPath(moduleDir, filePath);
let localDirPath = FileManager.local().joinPath(moduleDir, subDirectoryName);
let lastModifiedDate = isFileInstalled(localFilePath);
 
//if lastModifiedDate is newer older than the refresh interval, delete it and download the latest version
let fileInstalled = lastModifiedDate && (new Date() - lastModifiedDate) / 1000 < refreshInterval;

if (fileInstalled) {
    console.log(`File is installed. Last modified date: ${lastModifiedDate}`);
} else {
    console.log('File is not installed.');


    if (!FileManager.local().fileExists(localDirPath)) {
        FileManager.local().createDirectory(localDirPath);
            console.log('Directory created');
            // Execute the download and save process
            downloadAndSaveFile();
        } 
}



