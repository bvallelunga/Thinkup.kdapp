#!/usr/bin/env bash

# Setup
USER=$1
MYSQL_PASSWORD=$3

if [ -z "$MYSQL_PASSWORD" ]
then
  MYSQL="mysql -u root"
else
  MYSQL="mysql -u root --password=$MYSQL_PASSWORD"
fi

mkdir -p $OUT

# Start Coding Here...
touch $OUT/"10-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup
eval "$MYSQL -e 'DROP DATABASE Thinkup'"

touch $OUT/"20-Updating Libraries"
sudo apt-get -q -y update

touch $OUT/"30-Installing CURL Libraries"
sudo apt-get install -q -y curl libcurl3 libcurl3-dev php5-curl

touch $OUT/"40-Downloading Thinkup"
wget http://thinkup.com/download/ -O /tmp/thinkup.zip

touch $OUT/"60-Unzipping Thinkup"
unzip -q -o /tmp/thinkup.zip -d /tmp
rm -f /tmp/thinkup.zip

touch $OUT/"70-Installing Thinkup"
mv /tmp/thinkup /home/$USER/Web/thinkup
sudo chmod -R 755 /home/$USER/Web/thinkup
sudo chown -R www-data /home/$USER/Web/thinkup

touch $OUT/"80-Restarting MYSQL"
sudo rm /etc/init/mysql.override
sudo service mysql restart

touch $OUT/"90-Restarting Apache"
sudo rm /etc/init/apache.override;
sudo service apache2 restart

touch $OUT/"100-Configuring Thinkup"
curl -X POST "http://$USER.kd.io/thinkup/install/index.php?step=3"   \
  -d "full_name=Demo%20User"                                         \
  -d "site_email=demo%40koding.com"                                  \
  -d "password=demo1234"                                             \
  -d "confirm_password=demo1234"                                     \
  -d "timezone=America%2FLos_Angeles"                                \
  -d "db_host=localhost"                                             \
  -d "db_name=Thinkup"                                               \
  -d "db_user=root"                                                  \
  -d "db_passwd=$MYSQL_PASSWORD"                                     \
  -d "db_socket="                                                    \
  -d "db_port="                                                      \
  -d "db_prefix=tu_"

eval "$MYSQL -e 'USE Thinkup; UPDATE tu_owners SET is_activated=1;'"
