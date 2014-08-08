#!/usr/bin/env bash

# Setup
USER=$1
OUT=$2
MYSQL_PASSWORD=$3

if [ -z "$MYSQL_PASSWORD" ]
then
  MYSQL=mysql -u root
else
  MYSQL=mysql -u root --password=$MYSQL_PASSWORD
fi

rm -rf $OUT/*
mkdir -p $OUT

# Start Coding Here...
touch $OUT/"50-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup
$MYSQL -e "DROP DATABASE Thinkup"
