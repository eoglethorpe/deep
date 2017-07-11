# Elastic Beanstalk
---

## Setup
> Initialize and deploy to environment(Just cp and edit all files with `-sample` postfix)

#### Basic Config
```bash
cp .ebextensions/remote_log.config-sample .ebextensions/remote_log.config
vim .ebextensions/remote_log.config # Edit value as described
```

#### Docker Config [For Private Image]
> For Private Image from Docker Hub.

> Create mydockercfg in s3 bucket.

> Define the bucket name and file name in `Dockerrun.aws.json` file.

> Upload that mydockercfg file to that bucket.

`Dockerrun.aws.json`
```
{
  "AWSEBDockerrunVersion": "1",
  "Authentication": {
        "Bucket": "{Bucket containing mydockercfg}",
        "Key": "mydockercfg"
  },
  "Image": {
        "Name": "image_name",
        "Update": "true"
  },
  "Ports": [
    {
        "ContainerPort": "80"
    }
  ],
  "Volumes": []
}
```

`mydockercfg`
```
{
  "https://index.docker.io/v1/" :
  {
    "auth" : "{auth same from ~/.docker/config.json}",
    "email" : "your account email address"
  }
}
```

#### EB config and Deploy
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
