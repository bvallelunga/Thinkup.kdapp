#!/usr/bin/env bash

# Setup
USER=$1
OUT=$2
MYSQL_PASSWORD=$3 && ""
rm -rf $OUT/*
mkdir -p $OUT

# Start Coding Here...
touch $OUT/"50-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup
mysql -u root --password=$MYSQL_PASSWORD -e "DROP DATABASE Thinkup"
