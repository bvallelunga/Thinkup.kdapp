#!/usr/bin/env bash

# Setup
USER=$1
OUT=$2
rm -rf $OUT/*
mkdir -p $OUT

# Start Coding Here...
touch $OUT/"10-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup
yes | mysqladmin -u root drop Thinkup

touch $OUT/"20-Installing Libraries"
apt-get update
apt-get -y install apache2 php5-mysql libapache2-mod-php5unzip
apt-get -y install curl libcurl3 libcurl3-dev php5-curl php5-mcrypt php5-gd --fix-missing
apt-get -y install sendmail unzip
yes | sendmailconfig
ln -s /usr/sbin/sendmail /usr/bin/sendmail
service apache2 restart

touch $OUT/"40-Downloading Thinkup"
wget http://thinkup.com/download/ -O /tmp/thinkup.zip

touch $OUT/"60-Unzipping Thinkup"
unzip -q /tmp/thinkup.zip
rm /tmp/thinkup.zip

touch $OUT/"80-Installing Thinkup"
mv thinkup /home/$USER/Web/thinkup
chmod -R 777 /home/$USER/Web/thinkup
chown -r www-data /home/$USER/Web/thinkup

touch $OUT/"90-Restarting MYSQL"
rm /etc/init/mysql.override
service mysql restart

touch $OUT/"100-Restarting Apache"
rm /etc/init/apache.override;
service apache2 restart
