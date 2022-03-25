let elem;
let credits = getCookie('credits');
document.addEventListener('DOMContentLoaded', async () => {
  elem = document.querySelector('video');
  console.log(credits, typeof credits);
  if (typeof credits === 'undefined') {
    setCookie('credits', '0');
    credits = 0;
  }
  credits = Number(credits);
  elem.addEventListener('ended', () => {
    credits += 50;
    setCookie('credits', credits + 50 + '');
    window.location.reload()
  });
  const resp = await fetch('/randomVideo.mp4');
  const video = await resp.blob();
  elem.src = URL.createObjectURL(video);
  elem.style.display = 'block';
  //elem.click();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('credits').innerText = `You have got ${credits} social credits`
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
