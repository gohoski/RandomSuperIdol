var isFirefox = typeof InstallTrigger !== 'undefined';

document.addEventListener('DOMContentLoaded', () => {
  if (isFirefox)
    document.getElementById('firefox').style.display = 'block';
  else
    document.getElementById('chrome').style.display = 'block';
})
