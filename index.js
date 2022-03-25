const { webkit } = require('playwright');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { nanoid } = require('nanoid');
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs').promises;
const ytDlp = './yt-dlp';

(async () => {
  const glent = await fs.readdir('./videos/');
  if (Array.isArray(glent) && glent.length) {
  } else
    await getVideos();
  setInterval(async () => { await emptyDir('./videos/'); await getVideos() }, 86400000)
})();

async function getVideos() {
  console.log('Launching Webkit...');
  const browser = await webkit.launch();
  console.log("Opening Tian Yiming's Douyin page & waiting for network idle...");
  const page = await browser.newPage();
  await page.goto('https://www.douyin.com/user/MS4wLjABAAAA1EfwKVjULgmlYNqkJXnpHo_OEVwAyHqDj322ZV_UF7sd2X_CAMc2BAGPPpEttglX', { waitUntil: 'networkidle', timeout: 0 });
  let locator = await page.locator('a.B3AsdZT9.chmb2GX8.UwG3qaZV');
  for (let i = 0; i < await locator.count(); i++) {
    console.log(`Downloading video #${i + 1}...`);
    const url = await locator.nth(i).getAttribute('href');
    try {
      const { stdout, stderr } = await exec(`${ytDlp} https:${url} --cookies-from-browser firefox -o "videos/${nanoid()}.mp4"`);
    } catch {
      try {
        const { stdout, stderr } = await exec(`${ytDlp} https:${url} --cookies-from-browser firefox -o "videos/${nanoid()}.mp4"`);
      } catch {}
    }
  }
  console.log('Closing the browser...');
  await browser.close();
}

async function emptyDir(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    await fs.unlink(path.join(directory, file))
  }
}

/*process.on('SIGINT', async () => {
  console.log('Closing the browser...');
  await browser.close();
  process.exit();
});*/

// Server

app.get('/randomVideo.mp4', async (req, res) => {
  const videos = await fs.readdir('./videos/');
  const video = await fs.readFile(`./videos/${videos[Math.floor(Math.random() * 19)]}`);
  res.send(video)
})

app.listen(port, () => {
  console.log('Server listening')
})

app.use(express.static('static'));
