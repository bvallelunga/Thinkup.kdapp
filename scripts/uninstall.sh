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
touch $OUT/"50-Removing Thinkup"
rm -rf /home/$USER/Web/thinkup
eval "$MYSQL -e 'DROP DATABASE IF EXISTS Thinkup'"
