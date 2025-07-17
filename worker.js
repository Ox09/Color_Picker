/**
 * Web worker script for performing K-Means clustering on image pixel data.
 * Clustering is done on an RGB sample of the image.
 */

importScripts("k-means-clustering.js");

onmessage = (e) => {
  try {
    const { data, name, clusters } = e.data;

    const KMeans = new KMeansCluster(name, {
      data: getArrayOfRGB(data),
      clusters,
    });

    if (KMeans.isFinished) {
      self.postMessage({ type: "result", payload: KMeans.leadingColors });
    }
  } catch (err) {
    self.postMessage({ type: "error", message: err.message });
  }
};

/**
 * Converts a flat Uint8ClampedArray of RGBA values into a 2D array of RGB samples.
 * Skips over pixels based on image size for performance.
 *
 * @param {Uint8ClampedArray} data - Image pixel data.
 * @returns {number[][]} Array of RGB values.
 */
function getArrayOfRGB(data) {
  let array = [];
  let skip;

  switch (true) {
    case data.length > 500_000:
      skip = 15;
      break;
    case data.length > 300_000:
      skip = 12;
      break;
    case data.length > 200_000:
      skip = 9;
      break;
    case data.length > 100_000:
      skip = 6;
      break;
    default:
      skip = 3;
      break;
  }

  for (let i = 0; i < data.length; i += 4 * skip) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    array.push([r, g, b]);
  }

  return array;
}
