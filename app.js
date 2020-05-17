const fs = require('fs');
const fsPromises = fs.promises;
const puppeteer = require('puppeteer');
const captchaUri = process.env.CAPTCHA_DOMAIN;

if (!captchaUri) {
  throw('please provide URI for the CAPTCHA_DOMAIN env variable!');
}

(async () => {
  // reduce chrome security by altering flags
  const args = [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--window-size=1920,1080',
    '--start-fullscreen',
  ];
  const browser = await puppeteer.launch({ headless: true, args });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:75.0) Gecko/20100101 Firefox/75.0');
  await page.goto(captchaUri);

  // increase this delay time if your connection is not good
  await page.waitFor(1000);

  // get all iframes
  const frames = page.frames();
  const challengeFrame = frames[1];
  const checkBoxFrame = frames[2];

  // find and click checkbox to start
  await checkBoxFrame.hover('#checkbox');
  await checkBoxFrame.click('#checkbox');

  // increase this delay time if your connection is not good
  await page.waitFor(1000);

  // get hcaptcha spec
  const element = await challengeFrame.$('.prompt-text');
  const searchText = await challengeFrame.evaluate(element => element.textContent, element);
  const wordsArray = searchText.split(' ');
  const [keyword] = wordsArray.slice(-1);
  console.log('Keyword is: ', keyword);

  // get the challenge images (only first page)
  const images = await challengeFrame.$$('.task-grid .task-image .image');
  console.log(`${images.length} images found!`);

  // get the images count in folders
  const imageFiles = await fsPromises.readdir('images');
  const ssFiles = await fsPromises.readdir('ss');
  let imageCounter = imageFiles.length - 1;
  let ssCounter = ssFiles.length;

  // url extraction regex
  const urlRegex = /^url\("(.*)"\)$/;

  for (let image of images) {
    const backgroundImage = await challengeFrame.evaluate(image => image.style['background-image'], image);
    const matches = backgroundImage.match(urlRegex);
    if (matches.length > 0) {
      const url = matches[matches.length - 1];

      if (url) {
        // create a new tab
        const newTab = await browser.newPage();
        const imageSource = await newTab.goto(url);
        const buffer = await imageSource.buffer();

        // save image to the file
        ++imageCounter;
        await fsPromises.writeFile(`images/${imageCounter}.jpg`, buffer);
        console.log(`${imageCounter} saved`);

        // close tab
        await newTab.close();
      }
    }
  }

  // save screenshot to the
  ++ssCounter;
  await page.screenshot({ path: `ss/${ssCounter}.png`, fullPage: true });
  console.log(`Screenshot ${ssCounter} saved`);
  await browser.close();
})();
