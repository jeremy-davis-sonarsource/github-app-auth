const axios = require("axios").default;
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { exit } = require("process");

class GitHubAppConnector {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.jwtToken = undefined;
  }

  getInstallationAccessToken(id) {
    if (!this.jwtToken) {
      throw new Error("Call generateJwt to generate the JWT token");
    }

    return axios
      .post(
        `/app/installations/${id}/access_tokens`,
        {},
        {
          baseURL: this.baseURL,
          headers: {
            Authorization: `Bearer ${this.jwtToken}`,
            Accept: "application/vnd.github.machine-man-preview+json",
          },
        }
      )
      .then((response) => {
        // console.log(response);
        return response.data.token;
      })
      .catch((error) => console.log(error.code, error));
  }

  getInstallationId(repo) {
    if (!this.jwtToken) {
      throw new Error("Call generateJwt to generate the JWT token");
    }

    return axios
      .get(`/repos/${repo}/installation`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      })
      .then((response) => {
        // console.log(response.data);
        return response.data.id;
      });
  }

  getBranches(repo, accessToken) {
    return axios
      .get(`/repos/${repo}/branches`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error.code, error));
  }

  getBranchInfo(repo, accessToken, branch) {
    return axios
      .get(`/repos/${repo}/branches/${branch}`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error.code, error));
  }

  /* Follows:
   * https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps
   */
  generateJwt(appId) {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        iat: now - 60,
        iss: appId,
        exp: now + 600, // expires in 10 minutes
      },
      this.loadPem(),
      {
        algorithm: "RS256",
      }
    );

    this.jwtToken = token;
  }

  loadPem() {
    try {
      return fs.readFileSync("./private-key.pem", "utf8");
    } catch (_) {
      console.error(
        `you need to generate private key and place the pem file at the root of this project, named 'private-key.pem'`
      );
    }
  }
}

async function run() {
  const args = process.argv.slice(2);

  if (args.length < 3 || args.length > 4) {
    console.log(
      `This requires 3 to 4 arguments:
        - base url
        - appId
        - full repo name
        - [optional] branch name
      
      For example: 
        yarn start https://github.company.com/api/v3 32 Sonar/awesome-repo
      or
        yarn start https://github.company.com/api/v3 32 Sonar/awesome-repo feature-branch
      `
    );
    exit(1);
  }

  const [baseURL, appId, repo, branch] = args;

  const connector = new GitHubAppConnector(baseURL);

  connector.generateJwt(appId);

  const installationId = await connector.getInstallationId(repo);
  const accessToken = await connector.getInstallationAccessToken(installationId);

  if (branch) {
    connector.getBranchInfo(repo, accessToken, branch);
  } else {
    connector.getBranches(repo, accessToken);
  }
}

run();
