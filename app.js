const fs = require('fs');
const fsPromises = fs.promises;
const puppeteer = require('puppeteer');
const captchaUri = process.env.CAPTCHA_DOMAIN;

if (!captchaUri) {
  throw('please provide URI for the CAPTCHA_DOMAIN env variable!');
}

(async () => {
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
  await page.waitFor(1000);

  // get all frames
  const frames = page.frames();
  const challengeFrame = frames[1];
  const checkBoxFrame = frames[2];

  // find and click checkbox
  await checkBoxFrame.hover('#checkbox');
  await checkBoxFrame.click('#checkbox');
  await page.waitFor(1000);

  // get captcha spec
  const element = await challengeFrame.$('.prompt-text');
  const searchText = await challengeFrame.evaluate(element => element.textContent, element);
  const wordsArray = searchText.split(' ');
  const [keyword] = wordsArray.slice(-1);
  console.log('Keyword is: ', keyword);

  // get challenge images (first page)
  const images = await challengeFrame.$$('.task-grid .task-image .image');
  console.log(`${images.length} images found!`);

  // get images count in a folder
  const imageFiles = await fsPromises.readdir('images');
  const ssFiles = await fsPromises.readdir('ss');
  let imageCounter = imageFiles.length - 1;
  let ssCounter = ssFiles.length;

  // url extract regex
  const urlRegex = /^url\("(.*)"\)$/;

  for (let image of images) {
    console.log(image);
    const backgroundImage = await challengeFrame.evaluate(image => image.style['background-image'], image);
    const matches = backgroundImage.match(urlRegex);
    if (matches.length > 0) {
      const url = matches[matches.length - 1];

      if (url) {
        // create new tab
        const newTab = await browser.newPage();
        const imageSource = await newTab.goto(url);
        const buffer = await imageSource.buffer();
        ++imageCounter;
        // save image to file
        await fsPromises.writeFile(`images/${imageCounter}.jpg`, buffer);
        console.log(`${imageCounter} saved`);

        // close tab
        await newTab.close();
      }
    }
  }

  ++ssCounter;
  await page.screenshot({ path: `ss/${ssCounter}.png`, fullPage: true });
  console.log(`Screenshot ${ssCounter} saved`);
  await browser.close();
})();
