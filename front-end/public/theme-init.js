// Apply the saved theme before styles and Angular render, avoiding a light flash.
(function () {
  var theme;
  try { theme = localStorage.getItem('aero-theme'); } catch (_) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.bsTheme = theme;
})();
