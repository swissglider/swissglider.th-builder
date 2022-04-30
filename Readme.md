# Swissglider TheHome Builder

The Swissglider TheHome Builder is building the whole framework with React, TypeScript, Rollup, Storybook, NPM Package, semantic-release, GitHub, TailwindCSS

**creates:**
- new folder with the Project
- creates a dummy reusable component
    > not the whole react webapp

- creates a dummy storybook story
- creates a dummy liveStorybook to use with the final created npm package for this component
- creates a new github repository
- uploades the project to github
- publish to npm (via github workflow)
- publish liveStorybook to gh-pages (via github workflow)
    > new commits needs to hav the `ghp:` flag

## Requirement
Testes on Ubuntu with node 16.x.
Githb Account
NPMJS Account

### Must be intalled locally:
- Git
- gh cli (Github CLI)
- nodejs / npm
- sed
    > is it also available on MacOS ?

- internet access
- Github account

## Howto Use it

**Example**

```
npx swissglider.th-builder --projectName testP --author_name swissglider --author_email npm@mailschweiz.com --description "Das ist ein TestP"
```

### Post Activities
the following points are not done automatically:
- NPM_TOKEN has to be set in the new generated github repository
- Pages has to be activated on the new generated github account
- change LICENSE file if not MIT

## Parameters
**Mandatory**
> If not set on input it will be asked on the beginning

- projectName
- author_name
- author_email
- description

**optional**
- packageName
    > if not set it will take the projectName lowercased

- version
    > start version for the package.json  
    > default: 1.0.0

- license
    > default: MIT  
    > if not MIT, you have to change also the LICENSE File in the end

- branch
    > default: main

## What packages are used
- React
- react-dom
- TypeScript
- Rollup
    > used to package the final npm

- webpack
    > only used for storybook

- Storybook
- semantic-release
    > use to autocreate new version on the package.json

- TailwindCSS
  
## publish
| Type     | Release | remark |
|----------|---------|--------------|
| docs     | patch   |              |
| refactor | patch   |              |
| style    | patch   |              |
| feat     | patch   |              |
| ghp      | false   | github Pages |

## ToDo
- create Readme.md
- create help menu
- flag without publish to npm
- flag without publish gh-pages
- flag without liveStorybook
- flag without Tailwind
- refactor seed that is also running on macOS