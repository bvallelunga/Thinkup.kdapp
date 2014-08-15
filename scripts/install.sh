# Setup
USER=$1
EMAIL=$2
PASSWORD=$3
OUT=$4
MYSQL_PASSWORD=$5

if [ -z "$MYSQL_PASSWORD" ]
then
  MYSQL="mysql -u root"
else
  MYSQL="mysql -u root --password=$MYSQL_PASSWORD"
fi

mkdir -p $OUT

# Start Coding Here...
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
sudo service mysql restart

touch $OUT/"90-Restarting Apache"
sudo service apache2 restart

touch $OUT/"100-Configuring Thinkup"
curl -X POST "http://localhost/thinkup/install/index.php?step=3"     \
  -d "full_name=Demo%20User"                                         \
  -d "site_email=$EMAIL"                                             \
  -d "password=$PASSWORD"                                            \
  -d "confirm_password=$PASSWORD"                                    \
  -d "timezone=America%2FLos_Angeles"                                \
  -d "db_host=localhost"                                             \
  -d "db_name=Thinkup"                                               \
  -d "db_user=root"                                                  \
  -d "db_passwd=$MYSQL_PASSWORD"                                     \
  -d "db_socket="                                                    \
  -d "db_port="                                                      \
  -d "db_prefix=tu_"

eval "$MYSQL -e 'USE Thinkup; UPDATE tu_owners SET is_activated=1;'"
