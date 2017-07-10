# Deploy DEEP

### Using Docker

> Create Configs (copy and edit files having `-sample` postfix)

```bash
cd django
cp log_files.yml-sample log_files.yml
vim log_files.yml # Edit value with required value

cp mysql.cnf-sample mysql.cnf
vim mysql.cnf # Edit value with required value
```

> Build and push docker image, follow steps till `docker push` from
> [Readme](https://github.com/eoglethorpe/deep/tree/dockertest#docker)

> Now Goto `eb` branch and follow steps to deploy to [EBS](https://github.com/eoglethorpe/deep/tree/eb#elastic-beanstalk)
