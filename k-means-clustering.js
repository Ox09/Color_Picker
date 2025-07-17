/**
 Decide clusters
 Select random centroids at first
 Assign cluster
 Move centroids
 Check finish
 */

/**
 * @class KMeansCluster
 * @classdesc Class representing a K-Means clustering algorithm.
 */
class KMeansCluster {
  /** @type {number[][]} */
  #centroids = [];

  /** @type {number[][][]} */
  #clusterGroup = [];

  /**
   * Creates a KMeansCluster instance.
   * @param {string} name - The name of the clustering instance.
   * @param {Object} [config={}] - Configuration object.
   * @param {number} [config.clusters=2] - Number of clusters to form.
   * @param {number[][]} config.data - Dataset as an array of coordinate points.
   */
  constructor(name, config = {}) {
    this.name = name;
    this.clusters = config.clusters || 2;
    this.data = config.data;
    this.isFinished = false;
    this.leadingColors = [];

    this.#getInitialCentroids();
    this.#calculateClusterGroup();
  }

  /**
   * Initializes random centroids from the input data.
   * @private
   */
  #getInitialCentroids() {
    const set = new Set();
    while (set.size < this.clusters) {
      set.add(Math.floor(Math.random() * this.data.length));
    }
    this.#centroids = Array.from(set).map(
      (indexNumber) => this.data[indexNumber]
    );
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @private
   * @param {number[]} point1 - First point.
   * @param {number[]} point2 - Second point.
   * @returns {number} The Euclidean distance.
   * @throws Will throw an error if points are not arrays or if dimensions mismatch.
   */
  #calculateEuclieanDistance(point1, point2) {
    if (!Array.isArray(point1) || !Array.isArray(point2)) {
      throw new Error("Both points should be an array of points");
    }
    if (point1.length !== point2.length) {
      throw new Error("Both arrays should have same dimensions");
    }
    const distance = point1.map((point, i) => point2[i] - point);
    return Math.hypot(...distance);
  }

  /**
   * Groups data points into clusters based on closest centroids.
   * @private
   */
  #calculateClusterGroup() {
    let clusterGroup = [];
    let temp = new Map();

    for (let j = 0; j < this.#centroids.length; j++) {
      for (let i = 0; i < this.data.length; i++) {
        const p1 = this.data[i];
        const p2 = this.#centroids[j];
        const eud = this.#calculateEuclieanDistance(p1, p2);

        if (!clusterGroup[j]) {
          clusterGroup[j] = [];
        }
        if (!temp.has(p1)) temp.set(p1, []);
        temp.set(p1, [...temp.get(p1), eud]);
      }
    }

    temp.forEach((values, key) => {
      let min = Infinity;
      let minNumIndex = null;
      values.forEach((num, idx) => {
        if (num < min) {
          min = num;
          minNumIndex = idx;
        }
      });
      clusterGroup[minNumIndex]?.push(key);
    });

    this.#clusterGroup = clusterGroup;
    this.#moveCentroids();
  }

  /**
   * Recalculates centroids and checks for convergence.
   * @private
   */
  #moveCentroids() {
    const newCentroids = this.#clusterGroup.map((grp) => {
      if (grp.length === 1) return grp[0];

      const sum = grp.reduce((acc, curr) => acc.map((val, i) => val + curr[i]));
      return sum.map((val) => Math.round(val / grp.length));
    });

    const isSameCentroids = this.#centroids
      .flat()
      .every((val, idx) => val === newCentroids.flat()[idx]);
    this.isFinished = isSameCentroids;

    if (isSameCentroids) {
      this.leadingColors = newCentroids;
    } else {
      this.#centroids = newCentroids;
      this.#calculateClusterGroup();
    }
  }
}
