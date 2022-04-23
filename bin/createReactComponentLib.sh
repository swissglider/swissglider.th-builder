#!/bin/sh

# standard parameters
author=Swissglider
email=npm@mailschweiz.com

# error function
err(){
    echo "\033[31m E: $*" >>/dev/stderr
}

# set initial values
HELP=false
description=""

# Option strings
SHORT=o,h,p:
LONG=help,projectName:,description:,packageName:

# read the options
OPTS=$(getopt --options $SHORT --long $LONG --name "$0" -- "$@")

if [ $? != 0 ] ; then echo "Failed to parse options...exiting." >&2 ; exit 1 ; fi

eval set -- "$OPTS"

# extract options and their arguments into variables.
while true ; do
    case "$1" in
        --projectName )
            projectName="$2";
            shift 2;
            ;;
        --packageName )
            packageName="$2";
            shift 2;
            ;;
        --description )
            description="$2";
            shift 2;
            ;;
        -h | --help )
            HELP=true
            shift;
            ;;
        -- )
            shift;
            break;
            ;;
        * )
            echo "Unexpected option: $1 - this should not happen.";
            shift;
            exit 1;
            ;;
  esac
done

if $HELP == 'true'
then
    echo "Help Menu"
    exit 1
fi

# create project folder if not yet exists
if [ ! -d "$projectName" ];
then
    mkdir ./$projectName
fi

#check if project folder is empty, if not exit with message
if [ ! -z "$(ls -A ./$projectName)" ];
then
   err "Project Patch is not empy, so already exists. --> I will quit here"
   exit 1
fi

# install jq if not available
if [ $(dpkg-query -W -f='${Status}' jq 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  sudo apt-get install jq;
fi

# check if packageName is set
if [ -z "$packageName"];
then
    packageName="swissglider.$projectName";
fi

# change to directory
cd ./$projectName

#################################################################################################
echo "create package.json"
#################################################################################################
echo '
    {
        "name":"'$packageName'",
        "version": "0.0.1",
        "author": {
            "name":"'$author'",
            "email":"'$email'"
        },
        "scripts": {
            "test": "echo hallo"
        },
        "license": "MIT",
        "keywords": [
            "swissglider",
            "thehome",
            "skeleton",
            "react"
        ],
        "main": "dist/cjs/index.js",
        "module": "dist/esm/index.js",
        "files": [
            "dist"
        ],
        "types": "dist/index.d.ts"
    }' | jq '.' > package.json

#################################################################################################
echo "setup Git and install react/typescript"
#################################################################################################
git init --quiet --initial-branch=main
npm install react typescript @types/react --save-dev
npx tsc --init


#change back to home dir
cd ..