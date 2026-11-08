/* EMX on Roblox (home page): Share and Copy name on each game card ([data-roblox-game]).
   Share uses the device's own share sheet where there is one (phones), otherwise it copies the game's link.
   Play and View details are plain links, so the cards work without this script. */
(function () {
  "use strict";

  // the clipboard API first; if the browser refuses it (some in-app browsers do), the older copy command
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(field);
      if (ok) resolve();
      else reject(new Error("copy failed"));
    });
  }

  function say(card, message) {
    var status = card.querySelector(".roblox-game-status");
    if (!status) return;
    status.textContent = message;
    clearTimeout(status._emxTimer);
    status._emxTimer = setTimeout(function () {
      status.textContent = "";
    }, 2600);
  }

  function wire(card) {
    var name = card.getAttribute("data-name") || "EMX game";
    var url = card.getAttribute("data-url") || "";

    var share = card.querySelector("[data-roblox-share]");
    if (share) {
      share.addEventListener("click", function () {
        var data = { title: name, text: "Play " + name + " on Roblox", url: url };
        if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
          navigator.share(data).catch(function () {
            /* closing the share sheet is not an error */
          });
          return;
        }
        copyText(url).then(
          function () {
            say(card, "Link copied. Paste it anywhere to share " + name + ".");
          },
          function () {
            say(card, "Couldn't copy. The link is " + url);
          }
        );
      });
    }

    var copyName = card.querySelector("[data-roblox-copy-name]");
    if (copyName) {
      copyName.addEventListener("click", function () {
        copyText(name).then(
          function () {
            say(card, "Copied “" + name + "”. Search it in Roblox.");
          },
          function () {
            say(card, "Couldn't copy. Search “" + name + "” in Roblox.");
          }
        );
      });
    }
  }

  function start() {
    var cards = document.querySelectorAll("[data-roblox-game]");
    for (var i = 0; i < cards.length; i += 1) wire(cards[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
