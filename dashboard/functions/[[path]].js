/**
 * Cloudflare Pages Function: concept slide .mp4 files are stripped from CF
 * deploys (size limits). Redirect them to GitHub Pages where the videos live.
 */
const GH_DASHBOARD =
  "https://unipluseducationact-ctrl.github.io/koc-s3-math-dashboard/dashboard";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path.toLowerCase().endsWith(".mp4")) {
    // #region agent log
    console.log(
      JSON.stringify({
        sessionId: "f6bb99",
        hypothesisId: "A",
        location: "functions/[[path]].js",
        message: "redirect mp4 to GitHub Pages",
        data: { path, method: context.request.method },
        timestamp: Date.now(),
      })
    );
    // #endregion
    return Response.redirect(GH_DASHBOARD + path + url.search, 302);
  }

  return context.next();
}
