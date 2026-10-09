(function () {
  const theme = new URLSearchParams(window.location.search).get("theme");
  if (theme !== "slate" && theme !== "default") return;

  const apply = () => {
    const input = document.querySelector(
      'input[name="__palette"][data-md-color-scheme="' + theme + '"]'
    );
    if (input && !input.checked) {
      input.click();
    }
    document.documentElement.setAttribute("data-md-color-scheme", theme);
    if (document.body) {
      document.body.setAttribute("data-md-color-scheme", theme);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
