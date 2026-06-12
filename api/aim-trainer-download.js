const AIM_TRAINER_DOWNLOAD_URL = "https://github.com/tjcorp420/EFECT-AIM-TRAINER-UPDATES/releases/download/v0.3.0/EMX.Aim.Trainer_0.3.0_x64-setup.exe";

function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD");
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Method not allowed." }));
    return;
  }

  res.statusCode = 302;
  res.setHeader("location", AIM_TRAINER_DOWNLOAD_URL);
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex");
  res.end();
}

module.exports = handler;
