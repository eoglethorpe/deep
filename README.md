# Elastic Beanstalk
---

## Setup
> Initialize and deploy to environment(Just cp and edit all files with `-sample` postfix)

```bash
cp .ebextensions/remote_log.config-sample .ebextensions/remote_log.config
vim .ebextensions/remote_log.config # Edit value as described
```

> Commits new changes before using `eb deploy`.

```bash
eb init # to create config.yml (require once)
eb create env-name # to create new env(require once)
eb deploy # to deploy changes
eb ssh --setup # for ssh setup
eb ssh # for ssh
```

## Info

> .elasticbeanstalk/config.yml contains aws environment and application configs

> .ebextensions/ contains scripts which are run while deploying


## Future Ref

> Avoid 4XX, https://stackoverflow.com/questions/36398456/elastic-beanstalk-disable-health-state-change-based-on-4xx-responses
