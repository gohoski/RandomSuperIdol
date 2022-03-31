const { webkit } = require('playwright');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { nanoid } = require('nanoid');
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs').promises;
const ytDlp = './yt-dlp';
const fse = require('fs-extra');
let gettingVideos = false;

(async () => {
  const glent = await fs.readdir('./videos/douyin/');
  if (Array.isArray(glent) && glent.length) {
  } else
    await getVideos({ douyin: true });
  const kobyakov = await fs.readdir('./videos/bilibili/');
  if (Array.isArray(kobyakov) && kobyakov.length) {
  } else
    await getVideos({ douyin: false });
  setInterval(async () => {
    await fse.emptyDir('videos/bilibili');
    await fse.emptyDir('videos/douyin');
    await getVideos({ douyin: false });
    await getVideos({ douyin: true });
  }, 86400000)
})();

async function getVideos(settings) {
  gettingVideos = true;
  if (settings.douyin == true) {
    console.log('[DOUYIN]')
    console.log('Launching Webkit...');
    const browser = await webkit.launch();
    console.log("Opening Tian Yiming's Douyin account & waiting for network idle...");
    const page = await browser.newPage();
    await page.goto('https://www.douyin.com/user/MS4wLjABAAAA1EfwKVjULgmlYNqkJXnpHo_OEVwAyHqDj322ZV_UF7sd2X_CAMc2BAGPPpEttglX', { waitUntil: 'networkidle', timeout: 0 });
    let locator = await page.locator('a.B3AsdZT9.chmb2GX8.UwG3qaZV');
    for (let i = 0; i < await locator.count(); i++) {
      console.log(`Downloading video #${i + 1}...`);
      const url = await locator.nth(i).getAttribute('href');
      try {
        const { stdout, stderr } = await exec(`${ytDlp} https:${url} --cookies-from-browser firefox -o "videos/douyin/${nanoid()}.mp4"`);
        console.log(stdout, stderr)
      } catch {
        try {
          const { stdout, stderr } = await exec(`${ytDlp} https:${url} --cookies-from-browser firefox -o "videos/douyin/${nanoid()}.mp4"`);
          console.log(stdout, stderr)
        } catch {}
      }
    }
    console.log('Closing the browser...');
    await browser.close();
  } else {
    console.log('[BILIBILI]')
    console.log('Launching Webkit...');
    const browser = await webkit.launch();
    console.log("Opening Tian Yiming's BiliBili account & waiting for network idle...");
    const page = await browser.newPage();
    await page.goto('https://space.bilibili.com/477676711', { waitUntil: 'networkidle', timeout: 0 });
    let locator = await page.locator('a.cover');
    for (let i = 0; i < await locator.count(); i++) {
      console.log(`Downloading video #${i + 1}...`);
      const url = await locator.nth(i).getAttribute('href');
      try {
        const { stdout, stderr } = await exec(`${ytDlp} ${url} -o "videos/bilibili/${nanoid()}.mp4" -S "codec:avc"`);
        console.log(stdout, stderr)
      } catch {
        try {
          const { stdout, stderr } = await exec(`${ytDlp} ${url} -o "videos/bilibili/${nanoid()}.mp4" -S "codec:avc"`);
          console.log(stdout, stderr)
        } catch {}
      }
    }
    console.log('Closing the browser...');
    await browser.close();
  }
  gettingVideos = false
}

/*process.on('SIGINT', async () => {
  console.log('Closing the browser...');
  await browser.close();
  process.exit();
});*/

// Server

app.get('/douyin.mp4', async (req, res) => {
  res.type('mp4');
  if (gettingVideos) {
    res.status(503);
    res.send()
  } else {
    const videos = await fs.readdir('./videos/douyin/');
    console.log(videos);
    const videoPath = `./videos/douyin/${videos[Math.floor(Math.random() * (videos.length - 1))]}`;
    const videoSize = await getFileSize(videoPath);
    const video = await fs.readFile(videoPath);
    res.set('Content-Length', videoSize);
    res.send(video)
  }
})

app.get('/bilibili.mp4', async (req, res) => {
  res.type('mp4');
  if (gettingVideos) {
    res.status(503);
    res.send()
  } else {
    const videos = await fs.readdir('./videos/bilibili/');
    console.log(videos);
    const videoPath = `./videos/bilibili/${videos[Math.floor(Math.random() * (videos.length - 1))]}`;
    const videoSize = await getFileSize(videoPath);
    const video = await fs.readFile(videoPath);
    res.set('Content-Length', videoSize);
    res.send(video)
  }
})

app.listen(port, () => {
  console.log('Server listening')
})

app.use(express.static('static'));

async function getFileSize(filename) {
    const stats = await fs.stat(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}
