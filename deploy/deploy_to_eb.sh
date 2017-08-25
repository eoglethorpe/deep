#! /bin/bash

echo "::::: Gettings ENV Variables :::::"
    ENV_FILE=$1
    if [ -f "$ENV_FILE" ]; then
        echo "  >> Gettings ENV from file $ENV_FILE "
        source $ENV_FILE
        export $(cut -d= -f1 $ENV_FILE)
    else
        echo "  >> ENV FILE NOT FOUND"
        if [ -z ${TRAVIS_BUILD_ID+x} ]; then
            echo ">> ENV Variable Not Found, Set and try again(or use file)"
            exit 1
        fi
    fi

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $BASE_DIR

# cd to parent directory having Dockerfile
cd ../


echo "::::: Config for deep container :::::"
    cd deploy/django

    echo "  >> Creating mysql.cnf "
        eval "echo \"$(cat ./mysql.cnf-sample)\"" > ./mysql.cnf

    echo "  >> Creating log_files.yml "
        cp ./log_files.yml-sample ./log_files.yml
        sed "s/host:.*/host: $PAPERTRAIL_HOST/" -i ./log_files.yml
        sed "s/port:.*/port: $PAPERTRAIL_PORT/" -i ./log_files.yml
cd ../../

echo "::::: DOCKER TASK :::::"
    # If DOCKER_BUILD_ID is set, use it instead of TRAVIS_BUILD_ID env
    if ! [ -z ${DOCKER_BUILD_ID+x} ]; then
        TRAVIS_BUILD_ID=$DOCKER_BUILD_ID
    fi

    if ! [ -z ${BUILD_ID_POSTFIX+x} ]; then
        # Add postfix to build id (to seperate dev/prod images)
        TRAVIS_BUILD_ID=$TRAVIS_BUILD_ID-$BUILD_ID_POSTFIX
    fi
    echo $TRAVIS_BUILD_ID
    exit

    # Login to docker hub and Build Image
    echo "  >> Logging In to DockerHub "
        docker login -u="$LOGIN_DOCKER_USERNAME" -p="$LOGIN_DOCKER_PASSWORD";
    echo "  >> Building Image ($DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_BUILD_ID)"
        docker build -t $DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_BUILD_ID .
    echo "  >> Pushing Image ($DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_BUILD_ID)"
        set -e;
        docker push $DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_BUILD_ID
        set +e;

echo "::::: Config for EB :::::"
    cd deploy/eb

    echo "  >> Creating .elasticbeanstalk/config.yml file :::::"
        echo "1" | eb init $DEPLOYMENT_APP_NAME --region $DEPLOYMENT_REGION && eb use $DEPLOYMENT_ENV_NAME

    echo "  :: Creating additional configs :::::"
        echo "      >> Creating environmentvariables and remote_log.config"
            eval "echo \"$(cat ./.ebextensions/environmentvariables.config-sample)\"" > ./.ebextensions/environmentvariables.config
            eval "echo \"$(cat ./.ebextensions/env-instance-sample)\"" > ./.ebextensions/env-instance
        echo "      >> Creating nginx.conf "
            cp ./.ebextensions/nginx.conf-sample ./.ebextensions/nginx.conf
            sed "s/server_name #ALLOWED_HOST.*/server_name $DJANGO_ALLOWED_HOST;/" -i ./.ebextensions/nginx.conf
            sed "s/proxy_pass #S3_BUCKET_NAME_STATIC.*/proxy_pass https:\/\/$DJANGO_AWS_STORAGE_BUCKET_NAME_STATIC.s3.amazonaws.com\/static;/" -i ./.ebextensions/nginx.conf
            sed "s/proxy_pass #S3_BUCKET_NAME_MEDIA.*/proxy_pass https:\/\/$DJANGO_AWS_STORAGE_BUCKET_NAME_MEDIA.s3.amazonaws.com\/media;/" -i ./.ebextensions/nginx.conf
        echo "      >> Creating .mydockercfg "
            DOCKER_AUTH_TOKEN=($(jq -r '.auths["https://index.docker.io/v1/"].auth' ~/.docker/config.json))
            cat ./.mydockercfg-sample \
                | sed 's\DOCKER_AUTH\'$DOCKER_AUTH_TOKEN'\' \
                | sed 's\DOCKER_EMAIL\'$LOGIN_DOCKER_EMAIL'\' \
                > ./.mydockercfg
        echo "      >> Uploading .mydockercfg "
        aws s3 cp ./.mydockercfg s3://$DEPLOYMENT_BUCKET/.mydockercfg
        echo "      >> Creating Dockerrun.aws.json "
            cat ./Dockerrun.aws.json-sample \
                | sed 's\DEPLOYMENT_BUCKET\'$DEPLOYMENT_BUCKET'\' \
                | sed 's\DOCKER_AUTH_FILE\'.mydockercfg'\' \
                | sed 's\DOCKER_IMAGE\'$DOCKER_USERNAME/$DOCKER_REPOSITORY'\' \
                | sed 's\DOCKER_TAG\'$TRAVIS_BUILD_ID'\' \
                > ./Dockerrun.aws.json
echo "::::: Deploying to eb :::::"
    eb deploy
