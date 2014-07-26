#!/usr/bin/env bash

# Setup
USER=$1
OUT=$2
rm -rf $OUT/*
mkdir -p $OUT

# Start Coding Here...
touch $OUT/"10-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup

touch $OUT/"20-Downloading Thinkup"
wget http://thinkup.com/download/ -O /tmp/thinkup.zip

touch $OUT/"40-Unzipping Thinkup"
unzip -q /tmp/thinkup.zip
rm /tmp/thinkup.zip

touch $OUT/"60-Installing Thinkup"
mv thinkup /home/$USER/Web/thinkup
chmod -R 777 /home/bvallelunga/Web/thinkup/data/

touch $OUT/"80-Installing Curl PHP Library"
apt-get install -q -y curl libcurl3 libcurl3-dev php5-curl

touch $OUT/"90-Restarting MYSQL"
rm /etc/init/mysql.override;
service mysql restart

touch $OUT/"100-Restarting Apache"
rm /etc/init/apache.override; 
service apache2 restart
