# Elastic Beanstalk
---

## Setup
Initialize and deploy to environment
```bash
eb init # to create config.yml (require once)
eb create env-name # to create new env(require once)
eb deploy # to deploy changes
eb ssh --setup # for ssh setup
eb ssh # for ssh
```

## Info

> .elasticbeanstalk/config.yml contains environment and application configs

> .ebextensions/ contains scripts which are run while deploying
