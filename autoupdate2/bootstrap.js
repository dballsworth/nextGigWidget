// Define the repository details
const owner = 'dballsworth';
const repo = 'nextGigWidget';
const filePath = 'autoupdate/yourScript.js';
const branch = 'main';

// Define the subdirectory name to save the file
const subDirectoryName = 'autoupdate2';

// Construct the API URL to fetch the latest commit for the file
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branch}`;

// Function to fetch the last modified date
async function fetchLastModifiedDate() {
  try {
    let req = new Request(apiUrl);
    req.headers = {
      'Accept': 'application/vnd.github.v3+json',
      // 'Authorization': 'Bearer YOUR_GITHUB_TOKEN' // Uncomment if accessing a private repo
    };
    let response = await req.loadJSON();
    if (response.length > 0) {
      let commitDate = response[0].commit.committer.date;
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
  const lastModifiedDate = await fetchLastModifiedDate();
  if (lastModifiedDate) {
    const formattedDate = formatDate(lastModifiedDate);
    const fileName = `yourScript_${formattedDate}.js`;
    const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    
    // check to see if the directory exists and create it if it doesn't
    // returns path of latest module version which is accessible
    // returns path of latest module version which is accessible
    let fm = FileManager.local();
    let scriptPath = module.filename;
    let moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), subDirectoryName);
    const directoryPath = moduleDir
    console.log(`Directory path: ${directoryPath}`);

    if (!FileManager.local().fileExists(directoryPath)) {
      FileManager.local().createDirectory(directoryPath);
        console.log('Directory created');
    } // <-- Missing closing brace added here

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

// Execute the download and save process
downloadAndSaveFile();