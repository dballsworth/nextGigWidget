// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: grin-tongue-squint;

const scriptURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/nextGigWidget.js"; //hosted script URL
const imageURL = "https://raw.githubusercontent.com/dballsworth/nextGigWidget/main/dblogo.jpeg"; //hosted dependent file URL
const scriptName = "nextGigWidget";

async function createWidget() {
    // Check for updates before running the widget
    await checkForUpdate();

    // Create a new ListWidget instance
    let listwidget = new ListWidget();
    listwidget.backgroundColor = new Color("#1c1c1c");
    listwidget.url = "https://dickensandballsworth.com/dates-%26-shows";

    try {
        // Add the logo image
        let logoImage = await loadLogoImage("dblogo.jpeg");
        let stack = listwidget.addStack();
        stack.layoutHorizontally();
        stack.centerAlignContent();
        
        let imgStack = stack.addImage(logoImage);
        imgStack.imageSize = new Size(40, 40);
        imgStack.rightAlignImage();
    
        // Add countdown next to the logo
        stack.addSpacer(5);
        let countdownText = stack.addText(await getCountdownText());
        styleCountdownText(countdownText);
    
        // Add the launch date and location
        let launch = await getNextLaunch();
        displayLaunchDateTime(listwidget, getFormattedLaunchDate(launch.rStartDate));
        displayLocation(listwidget, launch.rSummary);
    } catch (error) {
        let errorText = listwidget.addText("Error: " + error.message);
        errorText.textColor = new Color("#ff0000");
        errorText.font = Font.boldSystemFont(14);
    }

    return listwidget;
}

// Load the logo image
async function loadLogoImage(filename) {
    let files = FileManager.iCloud();
    let path = files.joinPath(files.documentsDirectory(), filename);
    
    if (!files.fileExists(path)) {
        console.log("Image not found locally. Downloading from URL...");
        let req = new Request(imageURL);
        let img = await req.loadImage();
        files.writeImage(path, img);
        return img;
    }
    
    return files.readImage(path);
}


// Fetch and format countdown text
async function getCountdownText() {
    let launch = await getNextLaunch();
    if (!launch.rStartDate) {
        throw new Error("Launch date is undefined");
    }
    return getCountdown(launch.rStartDate);
}

// Style the countdown text
function styleCountdownText(textElement) {
    textElement.font = Font.boldSystemFont(16);
    textElement.textColor = new Color("#ffcc00");
    textElement.centerAlignText();
    textElement.minimumScaleFactor = 0.5;
}

// Fetch the next launch data
async function getNextLaunch() {
    const url = "https://smipleexpressapp.netlify.app/.netlify/functions/api/events";
    const request = new Request(url);
    const response = await request.loadJSON();
    let launch = getNextUpcomingEvent(response);
    if (!launch || !launch.start) {
        throw new Error("No upcoming events found or start date is missing");
    }
    return { rStartDate: launch.start, rSummary: launch.summary };
}

// Get formatted launch date
function getFormattedLaunchDate(launchData) {
    if (!launchData) return "Date not available";
    let launchDateTime = new Date(launchData);
    let options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    };
    return launchDateTime.toLocaleString('en-US', options);
}

// Display launch date in the widget
function displayLaunchDateTime(stack, launchDateTime) {
    addTextToStack(stack, launchDateTime, Font.semiboldSystemFont(15), "#ffffff");
}

// Display location in the widget
function displayLocation(stack, location) {
    addTextToStack(stack, location || "Location not available", Font.thinSystemFont(15), "#ffffff");
}

// Utility function to add text to a stack
function addTextToStack(stack, text, font, color) {
    let textElement = stack.addText(text);
    textElement.centerAlignText();
    textElement.font = font;
    textElement.textColor = new Color(color);
}

// Calculate countdown in days
function getCountdown(eventDate) {
    let eventDateTime = new Date(eventDate);
    let currentDateTime = new Date();
    let daysLeft = Math.ceil((eventDateTime - currentDateTime) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} days` : "Today!";
}

// Get the next upcoming event from the calendar data
function getNextUpcomingEvent(iCalendarData) {
    return iCalendarData && iCalendarData.length > 0 ? iCalendarData[0] : null;
}

// Self-updating mechanism
async function checkForUpdate() {
    let fm = FileManager.iCloud();
    let path = fm.joinPath(fm.documentsDirectory(), `${scriptName}.js`);

    let req = new Request(scriptURL);
    let latestScript = await req.loadString();
    let latestModifiedDate = req.response.headers['Last-Modified'];

    if (!fm.fileExists(path)) {
        fm.writeString(path, latestScript);
        console.log("Script downloaded for the first time.");
    } else {
        let currentModifiedDate = fm.modificationDate(path);
        if (latestModifiedDate > currentModifiedDate) {
            fm.writeString(path, latestScript);
            console.log("Script updated to the latest version.");
        } else {
            console.log("No updates available.");
        }
    }
}

let widget = await createWidget();
if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    widget.presentSmall();
}

Script.complete();

