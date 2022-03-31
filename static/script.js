let credits = getCookie('credits');
let getVideosFrom = getCookie('getVideosFrom');
document.addEventListener('DOMContentLoaded', async () => {
  let elem = document.querySelector('video');
  console.log(credits, typeof credits);
  if (typeof credits === 'undefined') {
    setCookie('credits', '0');
    credits = 0
  }
  if (typeof getVideosFrom === 'undefined') {
    setCookie('getVideosFrom', 'douyin');
    getVideosFrom = 'douyin'
  }
  credits = +credits;
  elem.addEventListener('ended', () => {
    credits += 50;
    setCookie('credits', credits + 50 + '');
    window.location.reload()
  });
  document.getElementById('credits').innerText = `You have got ${credits} social credits`;
  document.querySelector(`option[value=${getVideosFrom}]`).selected = true;
  let response;
  try {
    response = await fetch(`/${getVideosFrom}.mp4`);
  } catch {
    return alert('Technical difficulties, sorry. Please retry after a few mins.');
  }
  if (!response.ok)
    return alert('Technical difficulties, sorry. Please retry after around thirty mins.');
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let receivedLength = 0; // количество байт, полученных на данный момент
  let chunks = []; // массив полученных двоичных фрагментов (составляющих тело ответа)
  let loading = document.getElementById('loading');
  let progress = document.querySelector('progress');
  progress.max = contentLength;
  progress.style.display = 'block';
  let isPlaying = false;
  let interval = setInterval(() => {
    loading.innerText = `Loading video, please wait... (${receivedLength} of ${contentLength} bytes)`;
    progress.value = receivedLength;
  }, 100);
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      clearInterval(interval);
      break;
    }
    bytesDownloaded = value;
    chunks.push(value);
    receivedLength += value.length;
  }
  let resp = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    resp.set(chunk, position);
    position += chunk.length;
  }
  const video = new Blob([resp]);
  elem.src = URL.createObjectURL(video);
  elem.style.display = 'block';
  //elem.click();
  loading.style.display = 'none';
  progress.style.display = 'none';
  document.querySelector('video').onplay = () => {
    isPlaying = true;
  };
  setTimeout(() => {
    if (!isPlaying)
      window.location.replace('autoplay.html');
  }, 750)
});

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    'max-age': '999999999',
    SameSite: 'Strict',
    ...options
  };
  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }
  document.cookie = updatedCookie;
}

function clicker() {
  setCookie('credits', credits + 1 + '');
  credits += 1;
  console.log(credits, typeof credits);
  document.getElementById('credits').innerText = `You have got ${credits} social credits`
}

function changeGetVideosFrom() {
  getVideosFrom = document.querySelector('select').value;
  setCookie('getVideosFrom', getVideosFrom);
  window.location.reload()
}
