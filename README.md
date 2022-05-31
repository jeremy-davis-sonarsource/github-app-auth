# GitHub App Auth test

## clone or download
```
git clone git@github.com:jeremy-davis-sonarsource/github-app-auth.git
```
or download the zip [from github](https://github.com/jeremy-davis-sonarsource/github-app-auth)

## Add a private key 
Generate a private key from the app settings page, and place the `.pem` file to the root of this repository. Rename it `private-key.pem`.

## install dependencies

```javascript
yarn
```

## run

```javascript
yarn start https://github-enterprise.company.com/api/v3 32 owner/repo
  - or -
yarn start https://github-enterprise.company.com/api/v3 32 owner/repo main-branch
```